import * as chalk from 'chalk';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { ChildProcess, fork } from 'child_process';
import { randomUUID } from 'crypto';
import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor,
} from '@nx/devkit';
import { createAsyncIterable } from '@nx/devkit/src/utils/async-iterable';
import { PackageExecutorOptions } from './schema';
import { killTree } from './lib/kill-tree';


interface ActiveTask {
  id: string;
  killed: boolean;
  promise: Promise<void>;
  childProcess: null | ChildProcess;
  start: () => Promise<void>;
  stop: (signal: NodeJS.Signals) => Promise<void>;
}

function addFilesToZip(folderPath: string, zip: AdmZip) {
  addFolderToZip(folderPath, zip, '');
}

function addFolderToZip(folderPath: string, zip: AdmZip, parentPath: string) {
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    try {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const fileRelativePath = path
          .join(parentPath, file)
          .replace(/\\/g, '/');
        const fileContent = fs.readFileSync(filePath);
        zip.addFile(fileRelativePath, fileContent);
      } else if (stat.isDirectory()) {
        const subFolderPath = path.join(folderPath, file);
        const subFolderRelativePath = path.join(parentPath, file);
        addFolderToZip(subFolderPath, zip, subFolderRelativePath);
      }
    } catch (error) {
      logger.error(error);
    }
  });
}

export async function* packageExecutor(
  options: PackageExecutorOptions,
  context: ExecutorContext
) {
  process.env.NODE_ENV ??= context?.configurationName ?? 'development';
  const project = context.projectGraph.nodes[context.projectName];
  const buildTarget = parseTargetString(
    options.buildTarget,
    context.projectGraph
  );

  if (!project.data.targets[buildTarget.target]) {
    throw new Error(
      `Cannot find build target ${chalk.bold(
        options.buildTarget
      )} for project ${chalk.bold(context.projectName)}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildOptions: Record<string, any> = {
    ...readTargetOptions(buildTarget, context),
    ...options.buildTargetOptions,
  };

  if (options.waitUntilTargets && options.waitUntilTargets.length > 0) {
    const results = await runWaitUntilTargets(options, context);
    for (const [i, result] of results.entries()) {
      if (!result.success) {
        throw new Error(
          `Wait until target failed: ${options.waitUntilTargets[i]}.`
        );
      }
    }
  }

  const tasks: ActiveTask[] = [];
  let currentTask: ActiveTask = null;

  yield* createAsyncIterable<{
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>;
  }>(async ({ done, next }) => {
    const processQueue = async () => {
      if (tasks.length === 0) return;

      const previousTask = currentTask;
      const task = tasks.shift();
      currentTask = task;
      await previousTask?.stop('SIGTERM');
      await task.start();
    };

    const addToQueue = async () => {
      const task: ActiveTask = {
        id: randomUUID(),
        killed: false,
        childProcess: null,
        promise: null,
        start: async () => {
          if (options.runBuildTargetDependencies) {
            // If task dependencies are to be run, then we need to run through CLI since `runExecutor` doesn't support it.
            // eslint-disable-next-line no-async-promise-executor
            task.promise = new Promise<void>(async (resolve, reject) => {
              task.childProcess = fork(
                require.resolve('nx'),
                [
                  'run',
                  `${context.projectName}:${buildTarget.target}${
                    buildTarget.configuration
                      ? `:${buildTarget.configuration}`
                      : ''
                  }`,
                ],
                {
                  cwd: context.root,
                  stdio: 'inherit',
                }
              );
              task.childProcess.once('exit', (code) => {
                if (code === 0) resolve();
                else reject();
              });
            });
          } else {
            const output = await runExecutor(
              buildTarget,
              {
                ...options.buildTargetOptions,
                watch: false, // we'll handle the watch in this executor
              },
              context
            );
            // eslint-disable-next-line no-async-promise-executor
            task.promise = new Promise(async (resolve, reject) => {
              let error = false;
              let event;
              do {
                event = await output.next();
                if (event.value?.success === false) {
                  error = true;
                }
              } while (!event.done);
              if (error) reject();
              else resolve();
            });
          }

          // Wait for build to finish.
          try {
            await task.promise;
          } catch {
            throw new Error(`Build failed. See above for errors.`);
          }

          // Before running the program, check if the task has been killed (by a new change during watch).
          if (task.killed) return;

          // Zip the built handler
          task.promise = new Promise<void>(() => {         
            const { zipFilePath, extractPath } = options;
            const handlerPath = buildOptions.outputPath;

            const handlerName=context.targetName.replace(/^package-/, '');
            const zip = new AdmZip();

            const systemRoot = context.root;
            process.chdir(systemRoot);

            const relativePath = path.join(systemRoot, handlerPath);
            const zipFileOutputPath = path.join(systemRoot, zipFilePath) +'/handler.zip';
            
            logger.log(`Packaging ${chalk.green(handlerName)}`);
            addFilesToZip(relativePath, zip);
            zip.writeZip(zipFileOutputPath);
            logger.log(`Zip file created: ${chalk.green(zipFileOutputPath)}`)

            if (extractPath !== '') {
              logger.log(`Extracting ${chalk.green(handlerName)} to ${chalk.yellow(extractPath)}`);
              zip.extractAllTo(extractPath, true);
            }
            next({ success: true, options: buildOptions });
            done()
          });
        },

        stop: async (signal = 'SIGTERM') => {
          task.killed = true;
          // Request termination and wait for process to finish gracefully.
          // NOTE: `childProcess` may not have been set yet if the task did not have a chance to start.
          // e.g. multiple file change events in a short time (like git checkout).
          if (task.childProcess) {
            await killTree(task.childProcess.pid, signal);
          }
          try {
            await task.promise;
          } catch {
            // Doesn't matter if task fails, we just need to wait until it finishes.
          }
        },
      };

      tasks.push(task);
    };

    await addToQueue();
    await processQueue();
  });
}



export function runWaitUntilTargets(
  options: PackageExecutorOptions,
  context: ExecutorContext
): Promise<{ success: boolean }[]> {
  return Promise.all(
    options.waitUntilTargets.map(async (waitUntilTarget) => {
      const target = parseTargetString(waitUntilTarget, context.projectGraph);
      const output = await runExecutor(target, {}, context);
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<{ success: boolean }>(async (resolve) => {
        let event = await output.next();
        // Resolve after first event
        resolve(event.value as { success: boolean });

        // Continue iterating
        while (!event.done) {
          event = await output.next();
        }
      });
    })
  );
}



export default packageExecutor;
