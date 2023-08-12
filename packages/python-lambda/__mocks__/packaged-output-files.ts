import { package1, package2 } from './package-files';

const pathDir = [
  { name: 'main.py', isFile: true, contents: 'this is a py file' },
  {
    name: 'package1',
    isFile: false,
    contents: package1,
  },
  {
    name: 'package2',
    isFile: false,
    contents: package2,
  },
];
const pathDirMissing = [
  { name: 'main.py', isFile: true, contents: 'this is a py file' },
  {
    name: 'package2',
    isFile: false,
    contents: package2,
  },
];

const outputDir = [{ name: 'path', isFile: false, contents: pathDir }];
const outputDirMissing = [
  { name: 'path', isFile: false, contents: pathDirMissing },
];

export const packagedOutputFiles = [
  { name: 'output', isFile: false, contents: outputDir },
];
export const packagedOutputFilesMissing = [
  { name: 'output', isFile: false, contents: outputDirMissing },
];
