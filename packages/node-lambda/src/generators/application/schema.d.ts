import { Linter } from '@nx/linter';

export interface Schema {
  name: string;
  skipFormat?: boolean;
  skipPackageJson?: boolean;
  directory?: string;
  unitTestRunner?: 'jest' | 'none';
  linter?: Linter;
  tags?: string;
  setParserOptionsProject?: boolean;
  bundler?: 'esbuild' | 'webpack';
  skipDefaultHandler?: boolean;
}
