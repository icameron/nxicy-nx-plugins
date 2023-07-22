// eslint-disable-next-line @typescript-eslint/no-var-requires
export const nxVersion = require('../../package.json').version;
export const prettierVersion = '^2.6.2';
export const tsLibVersion = '^2.3.0';
export const typesNodeVersion = '18.7.1';
export const webpackVersion = '^16.5.2'

// Typescript
export const typescriptVersion = '~5.1.3';
/**
 * The minimum version is currently determined from the lowest version
 * that's supported by the lowest Angular supported version, e.g.
 * `npm view @angular/compiler-cli@14.0.0 peerDependencies.typescript`
 */
export const supportedTypescriptVersions = '>=4.6.2';