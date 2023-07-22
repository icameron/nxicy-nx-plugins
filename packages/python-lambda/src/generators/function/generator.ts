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
import { FunctionGeneratorSchema, NormalizedSchema } from './schema';

function normalizeOptions(
  tree: Tree,
  options: FunctionGeneratorSchema
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
    `${options.projectRoot}/src/functions/${options.name}`,
    templateOptions
  );
}

export async function functionGenerator(
  tree: Tree,
  options: FunctionGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const { projectRoot } = normalizedOptions;
  const projectConfig = readProjectConfiguration(tree, options.project);

  if (!projectConfig.targets) {
    projectConfig.targets = {};
  }
  projectConfig.targets[`package-${options.name}`] = {
    executor: '@nxicy/python-lambda:package',
    defaultConfiguration: 'development',
    options: {      
      functionPath: `${projectRoot}/src/functions/${options.name}/`,
      packages: [],
      zipFilePath: `dist/${projectRoot}/${options.name}`,
    },
    configurations: {
      development: {
        extractPath: `dist/${projectRoot}/${options.name}/function`,
      },
    },
  };
  updateProjectConfiguration(tree, options.project, projectConfig);

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default functionGenerator;
