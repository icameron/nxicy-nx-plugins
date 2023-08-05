export interface PackageExecutorSchema {
  handlerPath: string;
  zipFileOutputPath: string| null;
  packages?: string[];
  outputPath:string;
}
