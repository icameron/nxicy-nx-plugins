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

  it('should update project config with default esbuild config', async () => {
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
          executor: '@nx/esbuild:esbuild',
          outputs: ['{options.outputPath}'],
          options: {
            bundle: true,
            thirdParty: true,
            outputPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            outputFileName: 'index.js',
            main: `apps/my-project/src/handlers/my-node-lambda-handler/index.ts`,
            tsConfig: `apps/my-project/tsconfig.app.json`,
            external: [],
            esbuildOptions: {
              sourcemap: false,
              outExtension: { '.js': '.js' },
            },
          },
          configurations: {
            development: {
              sourcemap: true,
            },
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
          defaultConfiguration: 'production',
          options: {
            buildTarget: `my-project:build-my-node-lambda-handler`,
          },
          configurations: {
            development: {
              buildTarget: `my-project:build-my-node-lambda-handler:development`,
            },
            production: {
              zipFileOutputPath: `dist/apps/my-project/my-node-lambda-handler/zip`,
            },
          },
        },
      })
    );
  });

  it('should update project config with webpack config', async () => {
    appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
      bundler: 'webpack',
    });
    const project = readProjectConfiguration(appTree, 'my-project');
    expect(project.root).toEqual('apps/my-project');
    expect(project.targets).toEqual(
      expect.objectContaining({
        'build-my-node-lambda-handler': {
          executor: `@nx/webpack:webpack`,
          outputs: ['{options.outputPath}'],
          defaultConfiguration: 'production',
          options: {
            target: 'node',
            compiler: 'tsc',
            outputPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            outputFileName: 'index.js',
            main: `apps/my-project/src/handlers/my-node-lambda-handler/index.ts`,
            tsConfig: `apps/my-project/tsconfig.app.json`,
            webpackConfig: `apps/my-project/webpack.config.js`,
            externalDependencies: [],
          },
          configurations: {
            development: { sourceMap: true },
            production: { sourceMap: false },
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
          defaultConfiguration: 'production',
          options: {
            buildTarget: `my-project:build-my-node-lambda-handler`,
          },
          configurations: {
            development: {
              buildTarget: `my-project:build-my-node-lambda-handler:development`,
            },
            production: {
              zipFileOutputPath: `dist/apps/my-project/my-node-lambda-handler/zip`,
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
          executor: '@nx/esbuild:esbuild',
          outputs: ['{options.outputPath}'],
          options: {
            bundle: true,
            thirdParty: true,
            outputPath: `dist/apps/my-project/my-node-lambda-handler/handler`,
            outputFileName: 'index.js',
            main: `apps/my-project/src/handlers/my-node-lambda-handler/index.ts`,
            tsConfig: `apps/my-project/tsconfig.app.json`,
            external: [],
            esbuildOptions: {
              sourcemap: false,
              outExtension: { '.js': '.js' },
            },
          },
          configurations: {
            development: {
              sourcemap: true,
            },
          },
        },
        'package-my-node-lambda-handler': {
          executor: '@nxicy/node-lambda:package',
          defaultConfiguration: 'production',
          options: {
            buildTarget: `my-project:build-my-node-lambda-handler`,
          },
          configurations: {
            development: {
              buildTarget: `my-project:build-my-node-lambda-handler:development`,
            },
            production: {
              zipFileOutputPath: `dist/apps/my-project/my-node-lambda-handler/zip`,
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

  it('should generate files with webpack config', async () => {
    appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
      bundler:'webpack'
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
    expect(
      appTree.exists(
        'apps/my-project/webpack.config.js'
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
