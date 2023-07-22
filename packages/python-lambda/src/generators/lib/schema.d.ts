export interface LibraryGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
}
export interface NormalizedSchema extends LibraryGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}
