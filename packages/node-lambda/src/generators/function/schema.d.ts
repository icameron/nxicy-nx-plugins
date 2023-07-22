export interface LambdaFunctionGeneratorSchema {
  name: string;
  project: string;
}
export interface NormalizedSchema extends LambdaFunctionGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}
