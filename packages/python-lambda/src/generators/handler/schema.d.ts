export interface LambdaHandlerGeneratorSchema {
  name: string;
  project: string;
}

export interface NormalizedSchema extends LambdaHandlerGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}
