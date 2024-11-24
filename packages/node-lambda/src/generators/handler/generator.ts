import {
  offsetFromRoot,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  Tree,
  updateProjectConfiguration,
  readProjectConfiguration,
  addDependenciesToPackageJson,
  GeneratorCallback,
  runTasksInSerial,
} from '@nx/devkit';
import * as path from 'path';
import { LambdaHandlerGeneratorSchema, NormalizedSchema } from './schema';
import {
  getEsBuildConfig,
  getWebpackBuildConfig,
} from '../../utils/build-targets';
import { getPackageTarget } from '../../utils/package-target';
import { esbuildVersion, nxVersion } from '../../utils/versions';

export function normalizeOptions(
  tree: Tree,
  options: LambdaHandlerGeneratorSchema
): NormalizedSchema {
  const projectDirectory = options.project;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  options.bundler = options.bundler ?? 'esbuild';
  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
  };
}

function addProjectDependencies(
  tree: Tree,
  options: NormalizedSchema
): GeneratorCallback {
  const bundlers = {
    webpack: {
      '@nx/webpack': nxVersion,
    },
    esbuild: {
      '@nx/esbuild': nxVersion,
      esbuild: esbuildVersion,
    },
  };

  return addDependenciesToPackageJson(
    tree,
    {},
    {
      ...bundlers[options.bundler],
    }
  );
}

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  //bundler config
  if (options.bundler === 'webpack') {
    const webpackConfigData = tree.read(
      `${options.projectRoot}/webpack.config.js`
    );
    if (!webpackConfigData) {
      generateFiles(
        tree,
        path.join(__dirname, 'files/webpack'),
        `${options.projectRoot}`,
        templateOptions
      );
    }
  }

  //handler
  generateFiles(
    tree,
    path.join(__dirname, 'files/handler'),
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
  const tasks: GeneratorCallback[] = [];

  const installTask = addProjectDependencies(tree, normalizedOptions);
  tasks.push(installTask);

  const projectConfig = readProjectConfiguration(tree, options.project);

  if (!projectConfig.targets) {
    projectConfig.targets = {
      build: {
        executor: 'nx:noop',
        dependsOn: [],
        configurations: {
          development: {
            dependsOn: [],
          },
        },
      },
      package: {
        executor: 'nx:noop',
        dependsOn: [],
      },
    };
  }

  //update build and package
  const buildJSON = { ...projectConfig.targets['build'] };
  const buildStr = `build-${options.name}`;
  if (buildJSON.dependsOn && buildJSON.dependsOn.indexOf(buildStr) === -1) {
    buildJSON.dependsOn?.push(buildStr);
    buildJSON.configurations?.development?.dependsOn?.push(
      `${buildStr}:development`
    );
    projectConfig.targets['build'] = buildJSON;
  }

  const packageJSON = { ...projectConfig.targets['package'] };
  const packageStr = `package-${options.name}`;
  if (packageJSON.dependsOn && packageJSON.dependsOn.indexOf(buildStr) === -1) {
    packageJSON.dependsOn?.push(packageStr);
    projectConfig.targets['package'] = packageJSON;
  }

  projectConfig.targets[`build-${options.name}`] =
    options.bundler === 'esbuild'
      ? getEsBuildConfig(projectRoot, options.name)
      : getWebpackBuildConfig(projectRoot, options.name);

  projectConfig.targets[`package-${options.name}`] = getPackageTarget(
    projectRoot,
    projectName,
    options.name
  );
  updateProjectConfiguration(tree, options.project, projectConfig);

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
  return runTasksInSerial(...tasks);
}

export default lambdaHandlerGenerator;
