import * as fs from 'fs';

interface Folder {
  folderName?: string;
  files: Array<string | Folder>;
}

interface FileStat {
  name: string;
  type: 'File' | 'Folder';
}

type Tree = Array<string | Tree>;

function buildMockOrder(folder: Folder): FileStat[] {
  const mockOrder: any[] = [];
  folder.files.forEach((fileOrFolder) => {
    const isFile = typeof fileOrFolder === 'string';
    mockOrder.push({
      name: isFile ? fileOrFolder : fileOrFolder.folderName,
      type: isFile ? 'File' : 'Folder',
    });

    (fs.statSync as jest.Mock).mockImplementationOnce(() => ({
      isFile: () => isFile,
      isDirectory: () => !isFile,
    }));
    if (!isFile) {
      mockOrder.push(...buildMockOrder(fileOrFolder));
    }
  });
  return mockOrder;
}
// This creates series of mocks that the fs.readdirSync can walk through
function buildFileReadDirOrder(folder: Folder): Tree {
  const files: string[] = [];
  const subfolders: Folder[] = [];
  const tree: Tree = [];

  folder.files.forEach((fileOrFolder) => {
    const isFile = typeof fileOrFolder === 'string';
    if (isFile) {
      files.push(fileOrFolder);
    } else {
      files.push(fileOrFolder.folderName);
      subfolders.push(fileOrFolder);
    }
  });

  (fs.readdirSync as jest.Mock).mockReturnValueOnce(files);
  tree.push(files);

  subfolders.forEach((subfolder) => {
    tree.push(buildFileReadDirOrder(subfolder));
  });
  return tree;
}

export function buildFileAndFolderMockOrder(folder: Folder): {
  files: Tree;
  mockOrder: FileStat[];
} {
  const files = buildFileReadDirOrder(folder);
  const mockOrder = buildMockOrder(folder);
  return { files, mockOrder };
}
