


const handlerDir = [{ name: 'main.py', isFile: true, contents: 'main py' }];
const srcDir = [{ name: 'handler', isFile: false, contents: handlerDir }];
const projectDir = [{ name: 'src', isFile: false, contents: srcDir }];
const appsDir = [
  {
    name: 'project',
    isFile: false,
    contents: projectDir,
  },
];

export const appFiles = [
  { name: 'apps', isFile: false, contents: appsDir },
];
