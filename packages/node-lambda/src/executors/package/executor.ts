import * as chalk from 'chalk';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor,
} from '@nx/devkit';
import { PackageExecutorOptions } from './schema';

function addFolderToZip(folderPath: string, zip: AdmZip, parentPath = '') {
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

export async function packageExecutor(
  options: PackageExecutorOptions,
  context: ExecutorContext
) {
  process.env.NODE_ENV ??= context.configurationName ?? 'development';
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
  const runExecutorOutput = await runExecutor(
    buildTarget,
    {
      ...options.buildTargetOptions,
    },
    context
  );

  let buildSuccess = false;
  for await (const result of runExecutorOutput) {
    if (!result.success) {
      throw new Error(`Build failed. See above for errors.`);
    }
    buildSuccess = true;
  }

  const { zipFileOutputPath } = options;
  if (buildSuccess && zipFileOutputPath) {
    const handlerPath = buildOptions.outputPath;

    const handlerName = context.targetName.replace(/^package-/, '');
    const zip = new AdmZip();
    const systemRoot = context.root;
    process.chdir(systemRoot);

    const relativePath = path.join(systemRoot, handlerPath);
    const outputPath =
      path.join(systemRoot, options.zipFileOutputPath) +
      path.sep +
      'handler.zip';
    logger.log(`Packaging ${chalk.green(handlerName)}`);
    addFolderToZip(relativePath, zip);
    zip.writeZip(outputPath);
    logger.log(`Zip file created: ${chalk.green(outputPath)}`);
  }
  return { success: true };
}
export default packageExecutor;
