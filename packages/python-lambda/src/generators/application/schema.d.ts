export interface ServiceGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
}

export interface NormalizedSchema extends ServiceGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}
