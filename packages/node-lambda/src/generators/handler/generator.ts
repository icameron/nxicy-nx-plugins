import {
  offsetFromRoot,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  Tree,
  updateProjectConfiguration,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { LambdaHandlerGeneratorSchema, NormalizedSchema } from './schema';

export function normalizeOptions(
  tree: Tree,
  options: LambdaHandlerGeneratorSchema
): NormalizedSchema {
  const projectDirectory = options.project;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
  };
}

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    `${options.projectRoot}/src/handlers/${options.name}`,
    templateOptions
  );
}

export async function lambdaHandlerGenerator(
  tree: Tree,
  options: LambdaHandlerGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const { projectRoot, projectName } = normalizedOptions;
  const projectConfig = readProjectConfiguration(tree, options.project);

  if (!projectConfig.targets) {
    projectConfig.targets = {};
  }

  (projectConfig.targets[`build-${options.name}`] = {
    executor: '@nx/webpack:webpack',
    outputs: ['{options.outputPath}'],
    options: {
      target: 'node',
      compiler: 'tsc',
      outputPath: `dist/${projectRoot}/${options.name}/handler`,
      outputFileName: 'index.js',
      main: `${projectRoot}/src/handlers/${options.name}/index.ts`,
      tsConfig: `${projectRoot}/tsconfig.app.json`,
      assets: [],
      isolatedConfig: true,
      externalDependencies: 'none',
      webpackConfig: `${projectRoot}/webpack.config.js`,
    },
  }),
    (projectConfig.targets[`package-${options.name}`] = {
      executor: '@nxicy/node-lambda:package',
      defaultConfiguration: 'development',
      options: {
        buildTarget: `${projectName}:build-${options.name}`,
        zipFilePath: `dist/${projectRoot}/${options.name}`,
      },
      configurations: {
        development: {
          extractPath: `dist/${projectRoot}/${options.name}/handler`,
        },
      },
    });
  updateProjectConfiguration(tree, options.project, projectConfig);

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default lambdaHandlerGenerator;
