export interface PackageExecutorOptions {
  buildTarget: string;
  buildTargetOptions: Record<string, any>;
  zipFileOutputPath: string | null;
}
