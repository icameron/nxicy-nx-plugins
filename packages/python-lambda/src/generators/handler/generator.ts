import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  offsetFromRoot,
  names,
  Tree,
  updateProjectConfiguration,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { LambdaHandlerGeneratorSchema, NormalizedSchema } from './schema';
import { generatePackageTarget } from '../../utils/generate-packate-target';

function normalizeOptions(
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
function addFiles(tree: Tree, options: NormalizedSchema) {
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
  const { projectRoot } = normalizedOptions;
  const projectConfig = readProjectConfiguration(tree, options.project);

  if (!projectConfig.targets) {
    projectConfig.targets = {};
  }
  projectConfig.targets[`package-${options.name}`] = generatePackageTarget(projectRoot,options.name);
    
  updateProjectConfiguration(tree, options.project, projectConfig);

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default lambdaHandlerGenerator;
