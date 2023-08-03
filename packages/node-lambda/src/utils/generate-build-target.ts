export const generateBuildTargets = (projectRoot: string, name: string) => ({
  executor: '@nx/esbuild:esbuild',
  outputs: ['{options.outputPath}'],
  options: {
    bundle: true,
    thirdParty: true,
    outputPath: `dist/${projectRoot}/${name}/handler`,
    outputFileName: 'index.js',
    main: `${projectRoot}/src/handlers/${name}/index.ts`,
    tsConfig: `${projectRoot}/tsconfig.app.json`,
    external:[],
    esbuildOptions: {
      sourcemap: false,
      outExtension: { '.js': '.js' },
    },
  },
  configurations: {
    development: {
      sourcemap: true,
    },
  },
});
