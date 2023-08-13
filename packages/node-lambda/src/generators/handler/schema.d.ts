export interface LambdaHandlerGeneratorSchema {
  name: string;
  project: string;
  bundler?: 'esbuild' | 'webpack';
}
export interface NormalizedSchema extends LambdaHandlerGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}
