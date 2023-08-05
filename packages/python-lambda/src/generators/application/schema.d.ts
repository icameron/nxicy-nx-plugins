export interface ServiceGeneratorSchema {
  name: string;
  tags?: string;
}

export interface NormalizedSchema extends ServiceGeneratorSchema {
  projectName: string;
  projectRoot: string;
  parsedTags: string[];
}
