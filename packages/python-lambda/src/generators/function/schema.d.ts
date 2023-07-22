export interface FunctionGeneratorSchema {
  name: string;
  project: string;
}

export interface NormalizedSchema extends FunctionGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}
