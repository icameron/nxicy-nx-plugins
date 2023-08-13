/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from 'fs';
import * as path from 'path';

export interface Files {
  isFile: boolean;
  contents?: string;
}
export interface FolderMap {
  [key: string]: { [key: string]: Files } | object;
}
// @ts-ignore
const actualReadFileSync = jest.requireActual('fs').readFileSync;
// @ts-ignore
const actualStatSync = jest.requireActual('fs').statSync;
//@ts-ignore
const actualReaddirSync = jest.requireActual('fs').readdirSync;
//@ts-ignore
const actualCopyFileSync = jest.requireActual('fs').copyFileSync;
//@ts-ignore
const actualExistsSync = jest.requireActual('fs').existsSync;

const getFileOrFolderName = (filePath: fs.PathLike) => {
  const parsedFilePath = path.normalize(filePath.toString());
  const lastSeparatorIndex = parsedFilePath.lastIndexOf(path.sep);

  return lastSeparatorIndex !== -1
    ? parsedFilePath.slice(lastSeparatorIndex + 1)
    : null;
};

const checkFolderMap = (folderMap, pathName) => {
  const srcFile = getFileOrFolderName(pathName);
  const srcFolderPath = path.dirname(path.normalize(pathName.toString()));

  return (
    folderMap?.[srcFolderPath]?.[srcFile] ||
    folderMap?.[path.join(srcFolderPath, srcFile)] ||
    null
  );
};

function mockExistsSync(folderMap: FolderMap, pathName: fs.PathLike) {
  const srcData = checkFolderMap(folderMap, pathName);

  if (!srcData) {
    return actualExistsSync(pathName);
  }
  return true;
}

function mockMkdirSync(
  folderMap: FolderMap,
  pathName: fs.PathLike,
  options?: any
) {
  const pathString = path.normalize(pathName.toString());
  const dirData = folderMap?.[pathString];

  if (!dirData) {
    folderMap[pathString] = {};
  }
  let lastDirCreated = undefined;
  if (options?.recursive) {
    let dPath = path.dirname(pathString);
    while (dPath !== path.sep && dPath !== ".") {
      if (!folderMap[dPath]) {
        folderMap[dPath] = {};
      }
      lastDirCreated = dPath;
      dPath = path.dirname(dPath);
    }
  }
  return lastDirCreated;
}

function mockCopyFileSync(
  folderMap: FolderMap,
  src: fs.PathLike,
  dest: fs.PathLike,
  mode?: any
) {
  if (mode) {
    return actualCopyFileSync(src, dest, mode);
  }
  const srcData = checkFolderMap(folderMap, src);

  if (!srcData) {
    return actualCopyFileSync(src, dest, mode);
  }
  //Mutate the FolderMap

  const dirFile = getFileOrFolderName(src);
  const dirPath = path.dirname(path.normalize(dest.toString()));
  folderMap[dirPath][dirFile] = srcData;
  // add this as a subfolder to the part
  const parentDir = path.dirname(dirPath);
  const subfolderName = getFileOrFolderName(dirPath);
  if (parentDir && subfolderName) {
    if (!folderMap[parentDir]) {
      folderMap[parentDir] = {};
    }
    folderMap[parentDir][subfolderName] = {
      isFile: false,
    };
  }
  return true;
}

function mockStatSync(
  folderMap: FolderMap,
  filePath: fs.PathLike,
  options?: any
) {
  const file = getFileOrFolderName(filePath);
  const folderPath = path.dirname(path.normalize(filePath.toString()));

  if (options) {
    return actualStatSync(filePath, options);
  }

  const fileData = file
    ? folderMap?.[folderPath]?.[file]
    : folderMap?.[path.join(folderPath, file)];

  if (!fileData) {
    return actualStatSync(filePath);
  }

  const { isFile } = fileData;
  return {
    isFile: () => isFile,
    isDirectory: () => !isFile,
  };
}

function mockReaddirSync(
  folderMap: FolderMap,
  filePath: fs.PathLike,
  options?: any
) {
  if (options) {
    return actualReaddirSync(filePath, options);
  }
  const directoryPath = path.normalize(filePath.toString());
  const folderData = folderMap?.[directoryPath];
  return folderData ? Object.keys(folderData) : actualReaddirSync(filePath);
}

function mockReadFileSync(
  folderMap: FolderMap,
  filePath: fs.PathLike,
  options?: any
) {
  if (options) {
    return actualReadFileSync(filePath, options);
  }

  const file = getFileOrFolderName(filePath);
  const folderPath = path.dirname(path.normalize(filePath.toString()));
  const fileData = file ? folderMap?.[folderPath]?.[file] : null;
  if (fileData) {
    if (!fileData.contents) {
      throw new Error('No contents');
    }
    return fileData.contents;
  }

  return actualReadFileSync(filePath);
}

export const createFolderMap = (
  mockFolderStructure: any,
  filePath = ''
): FolderMap => {
  let mapping: FolderMap = {};
  const folderData: { [key: string]: Files } = {};

  const subfolders: any[] = [];
  for (const item of mockFolderStructure) {
    const { name, contents, isFile = true } = item;
    folderData[name] = {
      isFile,
      contents: isFile && contents,
    };
    if (!isFile) {
      const folderPath = `${filePath}${path.sep}${name}`;
      subfolders.push({ folderPath, contents: contents || [] });
    }
  }
  //parse subfolders
  subfolders.forEach((element) => {
    const { folderPath, contents } = element;
    const data = createFolderMap(contents, folderPath);
    mapping = Object.assign(mapping, data);
  });

  mapping[`${filePath ? filePath : path.sep}`] = folderData;
  return mapping;
};

export const mockFs = (folderMap: FolderMap) => {
  //@ts-ignore
  jest
    .spyOn(fs, 'statSync')
    .mockImplementation((filePath: fs.PathLike, options: any) =>
      mockStatSync(folderMap, filePath, options)
    );
  //@ts-ignore
  jest
    .spyOn(fs, 'readdirSync')
    .mockImplementation((filePath: fs.PathLike, options: any) =>
      mockReaddirSync(folderMap, filePath, options)
    );
  //@ts-ignore
  jest
    .spyOn(fs, 'readFileSync')
    .mockImplementation((filePath: fs.PathLike, options?: any) =>
      mockReadFileSync(folderMap, filePath, options)
    );
  //@ts-ignore
  jest
    .spyOn(fs, 'copyFileSync')
    .mockImplementation((filePath: fs.PathLike, options?: any) =>
      mockCopyFileSync(folderMap, filePath, options)
    );
  //@ts-ignore
  jest
    .spyOn(fs, 'existsSync')
    .mockImplementation((filePath: fs.PathLike) =>
      mockExistsSync(folderMap, filePath)
    );
  //@ts-ignore
  jest
    .spyOn(fs, 'mkdirSync')
    .mockImplementation((filePath: fs.PathLike, options?: any) =>
      mockMkdirSync(folderMap, filePath, options)
    );
};
