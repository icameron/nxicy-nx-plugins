export interface LibraryGeneratorSchema {
  name: string;  
}
export interface NormalizedSchema extends LibraryGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  
}
