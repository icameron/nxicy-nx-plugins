import { generatePackageTarget } from './generate-packate-target';

describe('generatePackageTarget', () => {
  it('should generate a package target', () => {
    const packageTarget = generatePackageTarget(
      'apps/my-project',
      'lambda-name'
    );

    expect(packageTarget).toEqual(
      expect.objectContaining({
        executor: '@nxicy/python-lambda:package',
        defaultConfiguration: 'development',
        options: {
          handlerPath: `apps/my-project/src/handlers/lambda-name/`,
          packages: [],
          zipFilePath: `dist/apps/my-project/lambda-name`,
        },
        configurations: {
          development: {
            extractPath: `dist/apps/my-project/lambda-name/handler`,
          },
        },
      })
    );
  });
});
