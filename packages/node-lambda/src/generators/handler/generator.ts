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
import { generateBuildTargets } from '../../utils/generate-build-target';
import { generatePackageTarget } from '../../utils/generate-package-target';

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

  projectConfig.targets[`build-${options.name}`] = generateBuildTargets(
    projectRoot,
    options.name
  );

  projectConfig.targets[`package-${options.name}`] = generatePackageTarget(
    projectRoot,
    projectName,
    options.name
  );
  updateProjectConfiguration(tree, options.project, projectConfig);

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default lambdaHandlerGenerator;
