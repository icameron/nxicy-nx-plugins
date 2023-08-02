export const generatePackageTarget = (
  projectRoot: string,
  projectName: string,
  name: string
) => ({
  executor: '@nxicy/node-lambda:package',
  defaultConfiguration: 'development',
  options: {
    buildTarget: `${projectName}:build-${name}`,
    zipFilePath: `dist/${projectRoot}/${name}`,
  },
  configurations: {
    development: {
      extractPath: `dist/${projectRoot}/${name}/handler`,
    },
  },
});
