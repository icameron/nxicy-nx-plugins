/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from 'fs';
import * as path from 'path';

export interface Files {
  isFile: boolean;
  contents?: string;
}
export interface FolderMap {
  [key: string]: { [key: string]: Files };
}
// @ts-ignore 
const actualReadFileSync = jest.requireActual('fs').readFileSync;
// @ts-ignore
const actualStatSync = jest.requireActual('fs').statSync;
//@ts-ignore
const actualReaddirSync = jest.requireActual('fs').readdirSync;

export const getFileOrFolderName = (filePath: fs.PathLike) => {
  const parsedFilePath = path.normalize(filePath.toString());
  const lastSeparatorIndex = parsedFilePath.lastIndexOf(path.sep);

  return lastSeparatorIndex !== -1
    ? parsedFilePath.slice(lastSeparatorIndex + 1)
    : null;
};

export function mockStatSync(
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

export function mockReaddirSync(
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

export function mockReadFileSync(
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
