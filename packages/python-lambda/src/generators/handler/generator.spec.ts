import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

// nx-ignore-next-line
import { lambdaHandlerGenerator } from './generator';
import applicationGenerator from '../application/generator';

describe('lambdaHandlerGenerator', () => {
  let appTree: Tree;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update project config', async () => {
    appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-python-lambda-handler',
      project: 'my-project',
    });
    const project = readProjectConfiguration(appTree, 'my-project');
    expect(project.root).toEqual('apps/my-project');
    expect(project.targets).toEqual(
      expect.objectContaining({
        'package-my-python-lambda-handler': {
          executor: '@nxicy/python-lambda:package',
          defaultConfiguration: 'development',
          options: {
            handlerPath: `apps/my-project/src/handlers/my-python-lambda-handler/`,
            packages: [],
            zipFilePath: `dist/apps/my-project/my-python-lambda-handler`,
          },
          configurations: {
            development: {
              extractPath: `dist/apps/my-project/my-python-lambda-handler/handler`,
            },
          },
        },
      })
    );
  });

  it('should create project targets if non exists config', async () => {
    appTree = await createTestApp('my-project');
    const tempProject = readProjectConfiguration(appTree, 'my-project');
    delete tempProject.targets;
    updateProjectConfiguration(appTree, 'my-project', tempProject);

    await lambdaHandlerGenerator(appTree, {
      name: 'my-python-lambda-handler',
      project: 'my-project',
    });
    const project = readProjectConfiguration(appTree, 'my-project');

    expect(project.root).toEqual('apps/my-project');
    expect(project.targets).toEqual(
      expect.objectContaining({
        'package-my-python-lambda-handler': {
          executor: '@nxicy/python-lambda:package',
          defaultConfiguration: 'development',
          options: {
            handlerPath: `apps/my-project/src/handlers/my-python-lambda-handler/`,
            packages: [],
            zipFilePath: `dist/apps/my-project/my-python-lambda-handler`,
          },
          configurations: {
            development: {
              extractPath: `dist/apps/my-project/my-python-lambda-handler/handler`,
            },
          },
        },
      })
    );
  });

  it('should generate files', async () => {
    appTree = await createTestApp('my-project');
    await lambdaHandlerGenerator(appTree, {
      name: 'my-python-lambda-handler',
      project: 'my-project',
    });
    expect(
      appTree.exists(
        'apps/my-project/src/handlers/my-python-lambda-handler/handler.py'
      )
    ).toBeTruthy();
  });
});

export async function createTestApp(libName: string): Promise<Tree> {
  const appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

  await applicationGenerator(appTree, {
    name: libName,
  });

  return appTree;
}
