export interface PackageExecutorOptions {
  runtimeArgs: string[];
  args: string[];
  waitUntilTargets: string[];
  buildTarget: string;
  buildTargetOptions: Record<string, any>;
  runBuildTargetDependencies?: boolean;
  functionPath: string;
  zipFilePath: string;
  packages?: string[];
  extractPath?: string;
}
