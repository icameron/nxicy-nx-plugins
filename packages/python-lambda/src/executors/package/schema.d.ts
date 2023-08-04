export interface PackageExecutorSchema {
  handlerPath: string;
  zipFileOutputPath: string;
  packages?: string[];
  outputPath:string;
}
