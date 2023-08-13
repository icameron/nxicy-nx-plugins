export const getPackageTarget = (projectRoot: string, name: string) => ({
  executor: '@nxicy/python-lambda:package',
  defaultConfiguration: 'production',
  options: {
    handlerPath: `${projectRoot}/src/handlers/${name}`,
    packages: [],
    outputPath: `dist/${projectRoot}/${name}/handler`,
  },
  configurations: {
    production: {
      zipFileOutputPath: `dist/${projectRoot}/${name}/zip`,
    },
  },
});
