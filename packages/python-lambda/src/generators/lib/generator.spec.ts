import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

// nx-ignore-next-line
import { libraryGenerator } from './generator';

describe('lambdaHandlerGenerator', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    jest.clearAllMocks();
  });

  it('should generate folder and files', async () => {
    await libraryGenerator(tree, {
      name: 'my-python-lib',
    });
    [
      'libs/python/my-python-lib/my_python_lib/__init__.py',
      'libs/python/my-python-lib/my_python_lib/module.py',
    ].forEach((path) => {
      expect(tree.exists(path)).toBeTruthy();
    });
  });
  it('should generate folder and files in correct python compatible name', async () => {
    await libraryGenerator(tree, {
      name: '1',
    });
    ['libs/python/1/_1/__init__.py', 'libs/python/1/_1/module.py'].forEach(
      (path) => {
        expect(tree.exists(path)).toBeTruthy();
      }
    );
  });
});
