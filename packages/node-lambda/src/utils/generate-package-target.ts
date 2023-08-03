export const generatePackageTarget = (
  projectRoot: string,
  projectName: string,
  name: string
) => ({
  executor: '@nxicy/node-lambda:package',
  defaultConfiguration: 'production',
  options: {
    buildTarget: `${projectName}:build-${name}`,
  },
  configurations: {
    development: {
      buildTarget: `${projectName}:build-${name}:development`,
    },
    production: {
      zipFileOutputPath: `dist/${projectRoot}/${name}`,
    },
  },
});
