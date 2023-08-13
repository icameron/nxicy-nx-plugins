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
import { getPackageTarget } from '../../utils/package-target';

function normalizeOptions(
  tree: Tree,
  options: ServiceGeneratorSchema
): NormalizedSchema {
  const projectDirectory = names(options.name).fileName;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name: names(projectName).fileName,
    projectName,
    projectRoot,
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

  addProjectConfiguration(tree, normalizedOptions.name, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      'package-get': getPackageTarget(projectRoot, 'get'),
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default applicationGenerator;
