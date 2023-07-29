export interface PackageExecutorSchema {
  handlerPath: string;
  zipFilePath: string;
  packages?: string[];
  extractPath?:string;
}
