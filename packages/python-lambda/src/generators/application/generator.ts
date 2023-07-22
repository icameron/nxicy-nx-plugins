import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { NormalizedSchema, ServiceGeneratorSchema } from './schema';

function normalizeOptions(
  tree: Tree,
  options: ServiceGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
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
    options.projectRoot,
    templateOptions
  );
}
export async function applicationGenerator(
  tree: Tree,
  options: ServiceGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const { projectRoot } = normalizedOptions;

  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      'package-get': {
        executor: '@nxicy/python-lambda:package',
        defaultConfiguration: 'development',
        options: {
          functionPath: `${projectRoot}/src/functions/get/`,
          packages: [],
          zipFilePath: `dist/${projectRoot}/get`,
        },
        configurations: {
          development: {
            extractPath: `dist/${projectRoot}/get/function`,
          },
        },
      },
    },
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default applicationGenerator;
