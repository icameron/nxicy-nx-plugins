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
import { getRelativePathToRootTsConfig, tsConfigBaseOptions } from '@nx/js';
import { join } from 'path';
import { esbuildVersion, nxVersion } from '../../utils/versions';
import { Schema } from './schema';
import { mapLintPattern } from '@nx/linter/src/generators/lint-project/lint-project';
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
  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: joinPathFragments(options.appProjectRoot, 'src'),
    projectType: 'application',
    targets: {
      'build-get':
        options.bundler === 'esbuild'
          ? getEsBuildConfig(options.appProjectRoot, 'get')
          : getWebpackBuildConfig(options.appProjectRoot, 'get'),
      'package-get': getPackageTarget(
        options.appProjectRoot,
        options.name,
        'get'
      ),
    },
    tags: options.parsedTags,
  };

  addProjectConfiguration(tree, options.name, project, true);
}

function addAppFiles(tree: Tree, options: NormalizedSchema) {
  if (options.bundler !== 'webpack') {
    tree.delete(joinPathFragments(options.appProjectRoot, 'webpack.config.js'));
  }

  generateFiles(tree, join(__dirname, 'files'), options.appProjectRoot, {
    ...options,
    tmpl: '',
    name: options.name,
    root: options.appProjectRoot,
    offset: offsetFromRoot(options.appProjectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(
      tree,
      options.appProjectRoot
    ),
  });
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
    eslintFilePatterns: [mapLintPattern(options.appProjectRoot, 'ts')],
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
  const tasks: GeneratorCallback[] = [];

  const installTask = addProjectDependencies(tree, options);
  tasks.push(installTask);

  addAppFiles(tree, options);
  addProject(tree, options);

  updateTsConfigOptions(tree, options);

  if (options.linter === Linter.EsLint) {
    const lintTask = await addLintingToApplication(tree, options);
    tasks.push(lintTask);
  }

  if (options.unitTestRunner === 'jest') {
    const { configurationGenerator } = ensurePackage('@nx/jest', nxVersion);
    const jestTask = await configurationGenerator(tree, {
      ...options,
      project: options.name,
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
    tree.delete(
      joinPathFragments(options.appProjectRoot, 'src/app/app.spec.ts')
    );
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

function normalizeOptions(host: Tree, options: Schema): NormalizedSchema {
  const { layoutDirectory, projectDirectory } = extractLayoutDirectory(
    options.directory
  );
  const appsDir = layoutDirectory ?? getWorkspaceLayout(host).appsDir;

  const appDirectory = projectDirectory
    ? `${names(projectDirectory).fileName}/${names(options.name).fileName}`
    : names(options.name).fileName;

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = joinPathFragments(appsDir, appDirectory);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];
  options.bundler = options.bundler ?? 'esbuild';
  return {
    ...options,
    name: names(appProjectName).fileName,
    appProjectRoot,
    parsedTags,
    linter: options.linter ?? Linter.EsLint,
    unitTestRunner: options.unitTestRunner ?? 'jest',
  };
}

export default applicationGenerator;
export const applicationSchematic = convertNxGenerator(applicationGenerator);
