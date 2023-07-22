export interface PackageExecutorSchema {
  functionPath: string;
  zipFilePath: string;
  packages?: string[];
  extractPath?:string;
}
