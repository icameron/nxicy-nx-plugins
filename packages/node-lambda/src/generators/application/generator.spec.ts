import * as devkit from '@nx/devkit';
import {
  getProjects,
  readJson,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

// nx-ignore-next-line
import { applicationGenerator } from './generator';
import { Linter } from '@nx/linter';
import { Schema } from './schema';

describe('app', () => {
  let tree: Tree;
  const name = 'myNodeLambdaApplication';
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    jest.clearAllMocks();
  });

  describe('not nested', () => {
    const schema = { name };
    it('should update project config', async () => {
      await applicationGenerator(tree, schema);
      const project = readProjectConfiguration(
        tree,
        'my-node-lambda-application'
      );
      expect(project.root).toEqual('apps/my-node-lambda-application');
      expect(project.targets.lint).toEqual({
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: ['apps/my-node-lambda-application/**/*.ts'],
        },
      });
      expect(project.targets['build-get']).toEqual({
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        options: {
          bundle: true,
          thirdParty: true,
          outputPath: 'dist/apps/my-node-lambda-application/get/handler',
          outputFileName: 'index.js',
          main: 'apps/my-node-lambda-application/src/handlers/get/index.ts',
          tsConfig: 'apps/my-node-lambda-application/tsconfig.app.json',
          external: [],
          esbuildOptions: {
            sourcemap: false,
            outExtension: { '.js': '.js' },
          },
        },
        configurations: {
          development: {
            sourcemap: true,
          },
        },
      });
      expect(project.targets['package-get']).toEqual({
        executor: '@nxicy/node-lambda:package',
        defaultConfiguration: 'production',
        options: {
          buildTarget: 'my-node-lambda-application:build-get',
        },
        configurations: {
          development: {
            buildTarget: 'my-node-lambda-application:build-get:development',
          },
          production: {
            zipFileOutputPath: 'dist/apps/my-node-lambda-application/get/zip',
          },
        },
      });
    });

    it('should update tags', async () => {
      await applicationGenerator(tree, { ...schema, tags: 'one,two' });
      const projects = Object.fromEntries(getProjects(tree));
      expect(projects).toMatchObject({
        'my-node-lambda-application': {
          tags: ['one', 'two'],
        },
      });
    });

    it('should generate files', async () => {
      await applicationGenerator(tree, schema);

      // Make sure these exist
      [
        `apps/my-node-lambda-application/jest.config.ts`,
        `apps/my-node-lambda-application/src/handlers/get/index.ts`,
        `apps/my-node-lambda-application/src/handlers/get/index.spec.ts`,
      ].forEach((path) => {
        expect(tree.exists(path)).toBeTruthy();
      });

      expect(
        tree.exists(`apps/my-node-lambda-application/webpack.config.ts`)
      ).toBeFalsy();

      const tsconfig = readJson(
        tree,
        'apps/my-node-lambda-application/tsconfig.json'
      );
      expect(tsconfig).toMatchInlineSnapshot(`
        {
          "compilerOptions": {
            "esModuleInterop": true,
          },
          "extends": "../../tsconfig.base.json",
          "files": [],
          "include": [],
          "references": [
            {
              "path": "./tsconfig.app.json",
            },
            {
              "path": "./tsconfig.spec.json",
            },
          ],
        }
      `);

      const tsconfigApp = readJson(
        tree,
        'apps/my-node-lambda-application/tsconfig.app.json'
      );
      expect(tsconfigApp.compilerOptions.outDir).toEqual('../../dist/out-tsc');
      expect(tsconfigApp.extends).toEqual('./tsconfig.json');
      expect(tsconfigApp.exclude).toEqual([
        'jest.config.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
      ]);
      const eslintrc = readJson(
        tree,
        'apps/my-node-lambda-application/.eslintrc.json'
      );
      expect(eslintrc).toMatchInlineSnapshot(`
        {
          "extends": [
            "../../.eslintrc.json",
          ],
          "ignorePatterns": [
            "!**/*",
          ],
          "overrides": [
            {
              "files": [
                "*.ts",
                "*.tsx",
                "*.js",
                "*.jsx",
              ],
              "rules": {},
            },
            {
              "files": [
                "*.ts",
                "*.tsx",
              ],
              "rules": {},
            },
            {
              "files": [
                "*.js",
                "*.jsx",
              ],
              "rules": {},
            },
          ],
        }
      `);
    });

    it('should extend from root tsconfig.json when no tsconfig.base.json', async () => {
      tree.rename('tsconfig.base.json', 'tsconfig.json');

      await applicationGenerator(tree, schema);

      const tsconfig = readJson(
        tree,
        'apps/my-node-lambda-application/tsconfig.json'
      );
      expect(tsconfig.extends).toBe('../../tsconfig.json');
    });
  });

  describe('nested', () => {
    const schema: Schema = { name, directory: 'myDir' };
    it('should update project config', async () => {
      await applicationGenerator(tree, schema);
      const project = readProjectConfiguration(
        tree,
        'my-dir-my-node-lambda-application'
      );

      expect(project.root).toEqual('apps/my-dir/my-node-lambda-application');

      expect(project.targets.lint).toEqual({
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: ['apps/my-dir/my-node-lambda-application/**/*.ts'],
        },
      });
    });

    it('should update tags', async () => {
      await applicationGenerator(tree, {
        ...schema,
        tags: 'one,two',
      });
      const projects = Object.fromEntries(getProjects(tree));
      expect(projects).toMatchObject({
        'my-dir-my-node-lambda-application': {
          tags: ['one', 'two'],
        },
      });
    });

    it('should generate files', async () => {
      const hasJsonValue = ({ path, expectedValue, lookupFn }) => {
        const config = readJson(tree, path);

        expect(lookupFn(config)).toEqual(expectedValue);
      };
      await applicationGenerator(tree, schema);

      // Make sure these exist
      [
        `apps/my-dir/my-node-lambda-application/jest.config.ts`,
        `apps/my-dir/my-node-lambda-application/src/handlers/get/index.ts`,
        `apps/my-dir/my-node-lambda-application/src/handlers/get/index.spec.ts`,
      ].forEach((path) => {
        expect(tree.exists(path)).toBeTruthy();
      });

      // Make sure these have properties
      [
        {
          path: 'apps/my-dir/my-node-lambda-application/tsconfig.app.json',
          lookupFn: (json) => json.compilerOptions.outDir,
          expectedValue: '../../../dist/out-tsc',
        },
        {
          path: 'apps/my-dir/my-node-lambda-application/tsconfig.app.json',
          lookupFn: (json) => json.compilerOptions.types,
          expectedValue: ['node'],
        },
        {
          path: 'apps/my-dir/my-node-lambda-application/tsconfig.app.json',
          lookupFn: (json) => json.exclude,
          expectedValue: [
            'jest.config.ts',
            'src/**/*.spec.ts',
            'src/**/*.test.ts',
          ],
        },
        {
          path: 'apps/my-dir/my-node-lambda-application/.eslintrc.json',
          lookupFn: (json) => json.extends,
          expectedValue: ['../../../.eslintrc.json'],
        },
      ].forEach(hasJsonValue);
    });
  });

  describe('layout directory', () => {
    const schema: Schema = {
      name,
      directory: 'apps/test-app',
    };
    it('should update project config', async () => {
      await applicationGenerator(tree, schema);
      const project = readProjectConfiguration(
        tree,
        'test-app-my-node-lambda-application'
      );
      expect(project.root).toEqual('apps/test-app/my-node-lambda-application');
      expect(project.targets.lint).toEqual({
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [
            'apps/test-app/my-node-lambda-application/**/*.ts',
          ],
        },
      });
    });

    it('should generate files', async () => {
      await applicationGenerator(tree, schema);

      // Make sure these exist
      [
        `apps/test-app/my-node-lambda-application/jest.config.ts`,
        `apps/test-app/my-node-lambda-application/src/handlers/get/index.ts`,
        `apps/test-app/my-node-lambda-application/src/handlers/get/index.spec.ts`,
      ].forEach((path) => {
        expect(tree.exists(path)).toBeTruthy();
      });

      const tsconfig = readJson(
        tree,
        'apps/test-app/my-node-lambda-application/tsconfig.json'
      );
      expect(tsconfig).toMatchInlineSnapshot(`
      {
        "compilerOptions": {
          "esModuleInterop": true,
        },
        "extends": "../../../tsconfig.base.json",
        "files": [],
        "include": [],
        "references": [
          {
            "path": "./tsconfig.app.json",
          },
          {
            "path": "./tsconfig.spec.json",
          },
        ],
      }
    `);

      const tsconfigApp = readJson(
        tree,
        'apps/test-app/my-node-lambda-application/tsconfig.app.json'
      );
      expect(tsconfigApp.compilerOptions.outDir).toEqual(
        '../../../dist/out-tsc'
      );
      expect(tsconfigApp.extends).toEqual('./tsconfig.json');
      expect(tsconfigApp.exclude).toEqual([
        'jest.config.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
      ]);
      const eslintrc = readJson(
        tree,
        'apps/test-app/my-node-lambda-application/.eslintrc.json'
      );
      expect(eslintrc).toMatchInlineSnapshot(`
      {
        "extends": [
          "../../../.eslintrc.json",
        ],
        "ignorePatterns": [
          "!**/*",
        ],
        "overrides": [
          {
            "files": [
              "*.ts",
              "*.tsx",
              "*.js",
              "*.jsx",
            ],
            "rules": {},
          },
          {
            "files": [
              "*.ts",
              "*.tsx",
            ],
            "rules": {},
          },
          {
            "files": [
              "*.js",
              "*.jsx",
            ],
            "rules": {},
          },
        ],
      }
    `);
    });
  });

  describe('linter option Linter.None', () => {
    const schema: Schema = {
      name,
      linter: Linter.None,
    };

    it('should allow none linter option', async () => {
      await applicationGenerator(tree, schema);
      const project = readProjectConfiguration(
        tree,
        'my-node-lambda-application'
      );
      expect(project.root).toEqual('apps/my-node-lambda-application');
    });
  });

  describe('--unit-test-runner none', () => {
    const schema: Schema = { name, unitTestRunner: 'none' };
    it('should not generate test configuration', async () => {
      await applicationGenerator(tree, schema);
      expect(tree.exists('jest.config.ts')).toBeFalsy();
      expect(
        tree.exists('apps/my-node-lambda-application/src/test-setup.ts')
      ).toBeFalsy();
      expect(
        tree.exists('apps/my-node-lambda-application/src/test.ts')
      ).toBeFalsy();
      expect(
        tree.exists('apps/my-node-lambda-application/tsconfig.spec.json')
      ).toBeFalsy();
      expect(
        tree.exists('apps/my-node-lambda-application/jest.config.ts')
      ).toBeFalsy();
      const project = readProjectConfiguration(
        tree,
        'my-node-lambda-application'
      );
      expect(project.targets.test).toBeUndefined();
      expect(project.targets.lint).toMatchInlineSnapshot(`
        {
          "executor": "@nx/linter:eslint",
          "options": {
            "lintFilePatterns": [
              "apps/my-node-lambda-application/**/*.ts",
            ],
          },
          "outputs": [
            "{options.outputFile}",
          ],
        }
      `);
    });
  });

  describe('--skipFormat', () => {
    it('should format files by default', async () => {
      jest.spyOn(devkit, 'formatFiles');

      await applicationGenerator(tree, { name });

      expect(devkit.formatFiles).toHaveBeenCalled();
    });

    it('should not format files when --skipFormat=true', async () => {
      jest.spyOn(devkit, 'formatFiles');

      await applicationGenerator(tree, {
        name,
        skipFormat: true,
      });

      expect(devkit.formatFiles).not.toHaveBeenCalled();
    });
  });

  describe('--bundler webpack', () => {
    const schema: Schema = { name, bundler: 'webpack' };

    it('should generate targets for webpack', async () => {
      await applicationGenerator(tree, schema);

      const project = readProjectConfiguration(
        tree,
        'my-node-lambda-application'
      );
      expect(project.root).toEqual('apps/my-node-lambda-application');
      expect(project.targets.lint).toEqual({
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: ['apps/my-node-lambda-application/**/*.ts'],
        },
      });
      expect(project.targets['build-get']).toEqual({
        executor: `@nx/webpack:webpack`,
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          target: 'node',
          compiler: 'tsc',
          outputFileName: 'index.js',
          outputPath: `dist/apps/my-node-lambda-application/get/handler`,
          main: `apps/my-node-lambda-application/src/handlers/get/index.ts`,
          tsConfig: `apps/my-node-lambda-application/tsconfig.app.json`,
          webpackConfig: `apps/my-node-lambda-application/webpack.config.js`,
          externalDependencies: [],
        },
        configurations: {
          development: { sourceMap: true },
          production: { sourceMap: false },
        },
      });
      expect(project.targets['package-get']).toEqual({
        executor: '@nxicy/node-lambda:package',
        defaultConfiguration: 'production',
        options: {
          buildTarget: 'my-node-lambda-application:build-get',
        },
        configurations: {
          development: {
            buildTarget: 'my-node-lambda-application:build-get:development',
          },
          production: {
            zipFileOutputPath: 'dist/apps/my-node-lambda-application/get/zip',
          },
        },
      });
    });
    it('should generate files with webpack config', async () => {
      await applicationGenerator(tree, schema);

      // Make sure these exist
      [
        `apps/my-node-lambda-application/jest.config.ts`,
        `apps/my-node-lambda-application/src/handlers/get/index.ts`,
        `apps/my-node-lambda-application/src/handlers/get/index.spec.ts`,
        `apps/my-node-lambda-application/webpack.config.js`,
      ].forEach((path) => {
        expect(tree.exists(path)).toBeTruthy();
      });

      const tsconfig = readJson(
        tree,
        'apps/my-node-lambda-application/tsconfig.json'
      );
      expect(tsconfig).toMatchInlineSnapshot(`
        {
          "compilerOptions": {
            "esModuleInterop": true,
          },
          "extends": "../../tsconfig.base.json",
          "files": [],
          "include": [],
          "references": [
            {
              "path": "./tsconfig.app.json",
            },
            {
              "path": "./tsconfig.spec.json",
            },
          ],
        }
      `);

      const tsconfigApp = readJson(
        tree,
        'apps/my-node-lambda-application/tsconfig.app.json'
      );
      expect(tsconfigApp.compilerOptions.outDir).toEqual('../../dist/out-tsc');
      expect(tsconfigApp.extends).toEqual('./tsconfig.json');
      expect(tsconfigApp.exclude).toEqual([
        'jest.config.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
      ]);
      const eslintrc = readJson(
        tree,
        'apps/my-node-lambda-application/.eslintrc.json'
      );
      expect(eslintrc).toMatchInlineSnapshot(`
        {
          "extends": [
            "../../.eslintrc.json",
          ],
          "ignorePatterns": [
            "!**/*",
          ],
          "overrides": [
            {
              "files": [
                "*.ts",
                "*.tsx",
                "*.js",
                "*.jsx",
              ],
              "rules": {},
            },
            {
              "files": [
                "*.ts",
                "*.tsx",
              ],
              "rules": {},
            },
            {
              "files": [
                "*.js",
                "*.jsx",
              ],
              "rules": {},
            },
          ],
        }
      `);
    });
  });
});
