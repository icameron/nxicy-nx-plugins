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
import {
  esbuildVersion,
  nxVersion,
  typesAwsLambdaVersion,
} from '../../utils/versions';

import { Schema } from './schema';
import { mapLintPattern } from '@nx/linter/src/generators/lint-project/lint-project';
import { generateBuildTargets } from '../../utils/generate-build-target';
import { generatePackageTarget } from '../../utils/generate-package-target';

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
      'build-get': generateBuildTargets(options.appProjectRoot, 'get'),
      'package-get': generatePackageTarget(
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
  generateFiles(tree, join(__dirname, './files'), options.appProjectRoot, {
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
    eslintFilePatterns: [
      mapLintPattern(options.appProjectRoot, 'ts', options.rootProject),
    ],
    unitTestRunner: options.unitTestRunner,
    skipFormat: true,
    setParserOptionsProject: options.setParserOptionsProject,
    rootProject: options.rootProject,
  });

  return lintTask;
}

function addProjectDependencies(
  tree: Tree,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: NormalizedSchema
): GeneratorCallback {
  const bundlers = {
    esbuild: {
      '@nx/esbuild': nxVersion,
      esbuild: esbuildVersion,
    },
  };
  const devDependencies = {
    '@types/aws-lambda': typesAwsLambdaVersion,
  };

  return addDependenciesToPackageJson(
    tree,
    {},
    {
      ...bundlers['esbuild'],
      ...devDependencies,
    }
  );
}

function updateTsConfigOptions(tree: Tree, options: NormalizedSchema) {
  updateJson(tree, `${options.appProjectRoot}/tsconfig.json`, (json) => {
    if (options.rootProject) {
      return {
        compilerOptions: {
          ...tsConfigBaseOptions,
          ...json.compilerOptions,
          esModuleInterop: true,
        },
        ...json,
        extends: undefined,
        exclude: ['node_modules', 'tmp'],
      };
    } else {
      return {
        ...json,
        compilerOptions: {
          ...json.compilerOptions,
          esModuleInterop: true,
        },
      };
    }
  });
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

  const appProjectRoot = options.rootProject
    ? '.'
    : joinPathFragments(appsDir, appDirectory);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name: names(appProjectName).fileName,
    appProjectRoot,
    parsedTags,
    linter: options.linter ?? Linter.EsLint,
    unitTestRunner: options.unitTestRunner ?? 'jest',
    rootProject: options.rootProject ?? false,
  };
}

export default applicationGenerator;
export const applicationSchematic = convertNxGenerator(applicationGenerator);
