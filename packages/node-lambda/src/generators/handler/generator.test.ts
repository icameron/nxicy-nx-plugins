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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update project config with default esbuild config', async () => {
    const appTree = await createTestApp('my-project',true);
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
            format: ['cjs'],
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
          executor: '@nx/eslint:lint',
          options: {
            lintFilePatterns: ['apps/my-project/**/*.ts'],
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

  it('should update project config with webpack config', async () => {
    const appTree = await createTestApp('my-project', true);
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
      bundler: 'webpack',
    });
    const project = readProjectConfiguration(appTree, 'my-project');
    expect(project.root).toEqual('apps/my-project');
    expect(project.targets).toEqual(
      expect.objectContaining({
        build: {
          executor: 'nx:noop',
          dependsOn: ['build-my-node-lambda-handler'],
          configurations: {
            development: {
              dependsOn: ['build-my-node-lambda-handler:development'],
            },
          },
        },
        package: {
          executor: 'nx:noop',
          dependsOn: ['package-my-node-lambda-handler'],
        },
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
          executor: '@nx/eslint:lint',
          options: {
            lintFilePatterns: ['apps/my-project/**/*.ts'],
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

  it('should create project targets if non exists config', async () => {
    const appTree = await createTestApp('my-project');
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
            format: ['cjs'],
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
    const appTree = await createTestApp('my-project');
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
    const appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
      bundler: 'webpack',
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
    expect(appTree.exists('apps/my-project/webpack.config.js')).toBeTruthy();
  });

  it('should generate files with webpack config and not override existing webpack config', async () => {
    const appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler',
      project: 'my-project',
      bundler: 'webpack',
    });
    // alter the webpack config
    const webpackConfigData = appTree.read(
      'apps/my-project/webpack.config.js',
      'utf-8'
    );
    const newConfig = webpackConfigData.replace(
      '  return config;',
      "  console.log('test');\n  return config;"
    );
    appTree.write('apps/my-project/webpack.config.js', newConfig);

    await lambdaHandlerGenerator(appTree, {
      name: 'my-node-lambda-handler-2',
      project: 'my-project',
      bundler: 'webpack',
    });

    const webpackConfigDataTest = appTree.read(
      'apps/my-project/webpack.config.js',
      'utf-8'
    );

    expect(webpackConfigDataTest).toEqual(newConfig);
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
    expect(appTree.exists('apps/my-project/webpack.config.js')).toBeTruthy();
  });
});

export async function createTestApp(
  libName: string,
  skipDefault?: boolean
): Promise<Tree> {
  const appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

  await applicationGenerator(appTree, {
    skipFormat: false,
    unitTestRunner: 'none',
    name: libName,
    skipDefaultHandler: skipDefault,
  });

  return appTree;
}
