import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

// nx-ignore-next-line
import { lambdaHandlerGenerator } from './generator';
import applicationGenerator from '../application/generator';

describe('lambdaHandlerGenerator', () => {
  let appTree: Tree;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update project config', async () => {
    appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
    });
    const project = readProjectConfiguration(appTree, 'my-project');
    expect(project.root).toEqual('apps/my-project');
    expect(project.targets).toEqual(
      expect.objectContaining({
        'build-my-node-lambda-handler': {
          executor: '@nx/webpack:webpack',
          outputs: ['{options.outputPath}'],
          options: {
            target: 'node',
            compiler: 'tsc',
            outputPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            outputFileName: 'index.js',
            main: `apps/my-project/src/handlers/my-node-lambda-handler/index.ts`,
            tsConfig: `apps/my-project/tsconfig.app.json`,
            assets: [],
            isolatedConfig: true,
            externalDependencies: 'none',
            webpackConfig: `apps/my-project/webpack.config.js`,
          },
        },
        lint: {
          executor: '@nx/linter:eslint',
          options: {
            lintFilePatterns: ['apps/my-project/**/*.ts'],
          },
          outputs: ['{options.outputFile}'],
        },
        'package-my-node-lambda-handler': {
          executor: '@nxicy/node-lambda:package',
          defaultConfiguration: 'development',
          options: {
            buildTarget: `my-project:build-my-node-lambda-handler`,
            zipFilePath: `dist/apps/my-project/my-node-lambda-handler`,
          },
          configurations: {
            development: {
              extractPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            },
          },
        },
      })
    );
  });

  it('should create project targets if non exists config', async () => {
    appTree = await createTestApp('my-project');
    const tempProject = readProjectConfiguration(appTree, 'my-project');
    delete tempProject.targets;
    updateProjectConfiguration(appTree, 'my-project', tempProject);

    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
    });
    const project = readProjectConfiguration(appTree, 'my-project');

    expect(project.root).toEqual('apps/my-project');
    expect(project.targets).toEqual(
      expect.objectContaining({
        'build-my-node-lambda-handler': {
          executor: '@nx/webpack:webpack',
          outputs: ['{options.outputPath}'],
          options: {
            target: 'node',
            compiler: 'tsc',
            outputPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            outputFileName: 'index.js',
            main: `apps/my-project/src/handlers/my-node-lambda-handler/index.ts`,
            tsConfig: `apps/my-project/tsconfig.app.json`,
            assets: [],
            isolatedConfig: true,
            externalDependencies: 'none',
            webpackConfig: `apps/my-project/webpack.config.js`,
          },
        },
        'package-my-node-lambda-handler': {
          executor: '@nxicy/node-lambda:package',
          defaultConfiguration: 'development',
          options: {
            buildTarget: `my-project:build-my-node-lambda-handler`,
            zipFilePath: `dist/apps/my-project/my-node-lambda-handler`,
          },
          configurations: {
            development: {
              extractPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            },
          },
        },
      })
    );
  });

  it('should generate files', async () => {
    appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
    });
    expect(
      appTree.exists(
        'apps/my-project/src/handlers/my-node-lambda-handler/index.spec.ts'
      )
    ).toBeTruthy();
    expect(
      appTree.exists(
        'apps/my-project/src/handlers/my-node-lambda-handler/index.ts'
      )
    ).toBeTruthy();
  });
});

export async function createTestApp(libName: string): Promise<Tree> {
  const appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

  await applicationGenerator(appTree, {
    skipFormat: false,
    unitTestRunner: 'none',
    name: libName,
  });

  return appTree;
}
