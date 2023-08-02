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
    esbuildOptions: {
      sourcemap: true,
      // Generate CJS files as .js so imports can be './foo' rather than './foo.cjs'.
      outExtension: { '.js': '.js' },
    },
  },
});
