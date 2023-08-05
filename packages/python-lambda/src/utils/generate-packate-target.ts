export const generatePackageTarget = (projectRoot: string, name: string) => ({
  executor: '@nxicy/python-lambda:package',
  defaultConfiguration: 'development',
  options: {
    handlerPath: `${projectRoot}/src/handlers/${name}/`,
    packages: [],
    zipFilePath: `dist/${projectRoot}/${name}`,
  },
  configurations: {
    development: {
      extractPath: `dist/${projectRoot}/${name}/handler`,
    },
  },
});
