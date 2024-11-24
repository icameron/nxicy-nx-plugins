import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  convertNxGenerator,
  ensurePackage,
  extractLayoutDirectory,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  ProjectConfiguration,
  runTasksInSerial,
  Tree,
  updateJson,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/linter';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { join } from 'path';
import { esbuildVersion, nxVersion } from '../../utils/versions';
import { Schema } from './schema';
import { getPackageTarget } from '../../utils/package-target';
import {
  getEsBuildConfig,
  getWebpackBuildConfig,
} from '../../utils/build-targets';

export interface NormalizedSchema extends Schema {
  appProjectRoot: string;
  parsedTags: string[];
}

function addProject(tree: Tree, options: NormalizedSchema) {
  const { appProjectRoot, skipDefaultHandler, parsedTags, name, bundler } =
    options;

  let defaultGetTargets = {};
  if (!skipDefaultHandler) {
    defaultGetTargets = {
      'build-get':
        bundler === 'esbuild'
          ? getEsBuildConfig(appProjectRoot, 'get')
          : getWebpackBuildConfig(appProjectRoot, 'get'),
      'package-get': getPackageTarget(appProjectRoot, name, 'get'),
    };
  }

  const project: ProjectConfiguration = {
    root: appProjectRoot,
    sourceRoot: joinPathFragments(appProjectRoot, 'src'),
    projectType: 'application',
    targets: {
      build: {
        executor: 'nx:noop',
        dependsOn: skipDefaultHandler ? [] : ['build-get'],
        configurations: {
          development: {
            dependsOn: skipDefaultHandler ? [] : ['build-get'],
          },
        },
      },
      package: {
        executor: 'nx:noop',
        dependsOn: skipDefaultHandler ? [] : ['package-get'],
      },
      ...defaultGetTargets,
    },
    tags: parsedTags,
  };

  addProjectConfiguration(tree, name, project, true);
}

function addAppFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    tmpl: '',
    name: options.name,
    root: options.appProjectRoot,
    offset: offsetFromRoot(options.appProjectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(
      tree,
      options.appProjectRoot
    ),
  };
  generateFiles(
    tree,
    join(__dirname, 'files/app'),
    options.appProjectRoot,
    templateOptions
  );
  if (!options.skipDefaultHandler) {
    generateFiles(
      tree,
      join(__dirname, 'files/default-handler'),
      options.appProjectRoot,
      templateOptions
    );
  }
  //bundler config
  if (options.bundler === 'webpack') {
    generateFiles(
      tree,
      join(__dirname, 'files/webpack'),
      options.appProjectRoot,
      templateOptions
    );
  }
}

export async function addLintingToApplication(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  const lintTask = await lintProjectGenerator(tree, {
    linter: options.linter,
    project: options.name,
    tsConfigPaths: [
      joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
    ],
    eslintFilePatterns: [joinPathFragments(options.appProjectRoot, '**/*.ts')],
    unitTestRunner: options.unitTestRunner,
    skipFormat: true,
    setParserOptionsProject: options.setParserOptionsProject,
  });

  return lintTask;
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
function updateTsConfigOptions(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, `${options.appProjectRoot}/tsconfig.json`, (json) => ({
    ...json,
    compilerOptions: {
      ...json.compilerOptions,
      esModuleInterop: true,
    },
  }));
}

export async function applicationGenerator(tree: Tree, schema: Schema) {
  const options = normalizeOptions(tree, schema);

  const { linter, name, appProjectRoot, skipFormat } = options;
  const tasks: GeneratorCallback[] = [];

  const installTask = addProjectDependencies(tree, options);
  tasks.push(installTask);

  addAppFiles(tree, options);
  addProject(tree, options);

  updateTsConfigOptions(tree, options);

  if (linter === Linter.EsLint) {
    const lintTask = await addLintingToApplication(tree, options);
    tasks.push(lintTask);
  }

  if (options.unitTestRunner === 'jest') {
    const { configurationGenerator } = ensurePackage('@nx/jest', nxVersion);
    const jestTask = await configurationGenerator(tree, {
      ...options,
      project: name,
      setupFile: 'none',
      skipSerializers: true,
      supportTsx: true,
      testEnvironment: 'node',
      compiler: 'tsc',
      skipFormat: true,
    });
    tasks.push(jestTask);
  } else {
    // No need for default spec file if unit testing is not setup.
    tree.delete(joinPathFragments(appProjectRoot, 'src/app/app.spec.ts'));
  }

  if (!skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

function normalizeOptions(host: Tree, options: Schema): NormalizedSchema {
  const {
    directory,
    name,
    tags,
    bundler,
    linter,
    unitTestRunner,
    skipFormat,
    skipPackageJson,
    setParserOptionsProject,
    skipDefaultHandler,
  } = options;

  const { layoutDirectory, projectDirectory } =
    extractLayoutDirectory(directory);
  const appsDir = layoutDirectory ?? getWorkspaceLayout(host).appsDir;

  const appDirectory = projectDirectory
    ? `${names(projectDirectory).fileName}/${names(name).fileName}`
    : names(name).fileName;

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = joinPathFragments(appsDir, appDirectory);

  const parsedTags = tags ? tags.split(',').map((s) => s.trim()) : [];
  const normalizedBundler = bundler ?? 'esbuild';
  const normalizedLinter = linter ?? Linter.EsLint;
  const normalizedUnitTestRunner = unitTestRunner ?? 'jest';

  const normalizedOptions = {
    bundler: normalizedBundler,
    linter: normalizedLinter,
    unitTestRunner: normalizedUnitTestRunner,
    name: names(appProjectName).fileName,
    skipFormat,
    skipPackageJson,
    setParserOptionsProject,
    skipDefaultHandler,
    appProjectRoot,
    parsedTags,
  };

  return normalizedOptions;
}

export default applicationGenerator;
export const applicationSchematic = convertNxGenerator(applicationGenerator);
