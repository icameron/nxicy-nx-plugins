import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  Tree,
  offsetFromRoot,
} from '@nx/devkit';
import * as path from 'path';
import { LibraryGeneratorSchema, NormalizedSchema } from './schema';

function normalizeOptions(
  tree: Tree,
  options: LibraryGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
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

function convertToPythonCompatibleName(filename: string): string {
  // Replace invalid characters with underscores
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_]/g, '_');

  // Ensure the name starts with a letter or underscore
  let pythonName = sanitizedFilename.replace(/^[^a-zA-Z_]+/, '');

  // If the resulting name is empty, prepend an underscore
  if (!pythonName) {
    pythonName = '_' + sanitizedFilename;
  }

  return pythonName;
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  const libsDir = getWorkspaceLayout(tree).libsDir;
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    `${libsDir}/python/${options.name}/${convertToPythonCompatibleName(
      options.name
    )}`,
    templateOptions
  );
}
export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

export default libraryGenerator;
