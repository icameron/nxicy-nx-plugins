import { joinPathFragments } from '@nx/devkit';

export const getEsBuildConfig = (projectRoot: string, name: string) => ({
  executor: '@nx/esbuild:esbuild',
  outputs: ['{options.outputPath}'],
  options: {
    bundle: true,
    thirdParty: true,
    outputPath: joinPathFragments('dist', projectRoot, name, 'handler'),
    outputFileName: 'index.js',
    main: joinPathFragments(projectRoot, 'src', 'handlers', name, 'index.ts'),
    tsConfig: joinPathFragments(projectRoot, 'tsconfig.app.json'),
    external: [],
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

export const getWebpackBuildConfig = (projectRoot: string, name: string) => ({
  executor: `@nx/webpack:webpack`,
  outputs: ['{options.outputPath}'],
  defaultConfiguration: 'production',
  options: {
    target: 'node',
    compiler: 'tsc',
    outputFileName: 'index.js',
    outputPath: joinPathFragments('dist', projectRoot, name, 'handler'),
    main: joinPathFragments(projectRoot, 'src', 'handlers', name, 'index.ts'),
    tsConfig: joinPathFragments(projectRoot, 'tsconfig.app.json'),
    webpackConfig: joinPathFragments(projectRoot, 'webpack.config.js'),
    externalDependencies: [],
  },
  configurations: {
    development: { sourceMap: true },
    production: { sourceMap: false },
  },
});
