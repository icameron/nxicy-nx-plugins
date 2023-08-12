
const handlerDirX = [
  {
    name: 'handler',
    isFile: false,
    contents: [
      {
        name: 'index.js',
        isFile: true,
        contents: undefined,
      },
      {
        name: 'empty-dir',
        isFile: false,
      },
    ],
  },
];

const getDirX = [
  {
    name: 'get',
    isFile: false,
    contents: handlerDirX,
  },
];
const myProjectDirX = [
  {
    name: 'my-project',
    isFile: false,
    contents: getDirX,
  },
];

const appsDirX = [
  {
    name: 'apps',
    isFile: false,
    contents: myProjectDirX,
  },
];

const buildFolderError = [
  {
    name: 'dist',
    isFile: false,
    contents: appsDirX,
  },
];

const handlerDir = [
  {
    name: 'handler',
    isFile: false,
    contents: [
      {
        name: 'index.js',
        isFile: true,
        contents: 'test',
      },
      {
        name: 'empty-dir',
        isFile: false,
      },
    ],
  },
];

const getDir = [
  {
    name: 'get',
    isFile: false,
    contents: handlerDir,
  },
];
const myProjectDir = [
  {
    name: 'my-project',
    isFile: false,
    contents: getDir,
  },
];

const appsDir = [
  {
    name: 'apps',
    isFile: false,
    contents: myProjectDir,
  },
];

const buildFolder = [
  {
    name: 'dist',
    isFile: false,
    contents: appsDir,
  },
];

export const buildOutput = buildFolder;
export const buildOutputError = buildFolderError;
