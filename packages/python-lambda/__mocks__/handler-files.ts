const pathDir = [{ name: 'main.py', isFile: true, contents: 'main py' }];

const handlerDir = [
  {
    name: 'path',
    isFile: false,
    contents: pathDir,
  },
];

export const handlerFiles = [
  { name: 'handler', isFile: false, contents: handlerDir },
];
