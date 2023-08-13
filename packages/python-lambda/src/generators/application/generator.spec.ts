import * as devkit from '@nx/devkit';
import { getProjects, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

// nx-ignore-next-line
import { applicationGenerator } from './generator';

describe('app', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    jest.clearAllMocks();
  });

  it('should update project config', async () => {
    await applicationGenerator(tree, {
      name: 'myPythonLambdaApplication',
    });
    const project = readProjectConfiguration(
      tree,
      'my-python-lambda-application'
    );
    expect(project.root).toEqual('apps/my-python-lambda-application');
    expect(project.targets).toEqual(
      expect.objectContaining({
        'package-get': {
          executor: '@nxicy/python-lambda:package',
          defaultConfiguration: 'production',
          options: {
            handlerPath: `apps/my-python-lambda-application/src/handlers/get`,
            packages: [],
            outputPath: `dist/apps/my-python-lambda-application/get/handler`,
          },
          configurations: {
            production: {
              zipFileOutputPath: `dist/apps/my-python-lambda-application/get/zip`,
            },
          },
        },
      })
    );
  });

  it('should generate files', async () => {
    await applicationGenerator(tree, {
      name: 'myPythonLambdaApplication',
    });

    // Make sure these exist
    [`apps/my-python-lambda-application/src/handlers/get/handler.py`].forEach(
      (path) => {
        expect(tree.exists(path)).toBeTruthy();
      }
    );
  });
  it('should update tags', async () => {
    await applicationGenerator(tree, {
      name: 'myPythonLambdaApplication',
      tags: 'one,two',
    });
    const projects = Object.fromEntries(getProjects(tree));
    expect(projects).toMatchObject({
      'my-python-lambda-application': {
        tags: ['one', 'two'],
      },
    });
  });
});
