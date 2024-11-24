import {
  buildOutput,
  buildOutputError,
} from '../../../__mocks__/build-output-files';
import {
  createProjectGraphFromProjectConfiguration,
  getProjectConfigurations,
  createFolderMap,
  mockFs,
} from '@nxicy/testing';
import * as chalk from 'chalk';
import packageExecutor from './executor';
import * as AdmZip from 'adm-zip';
import * as devkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../../generators/application/generator';
import * as fs from 'fs';

jest.mock('adm-zip');
jest.mock('@nx/devkit', () => ({
  __esModule: true,
  ...jest.requireActual('@nx/devkit'),
}));

describe('packageExecutor', () => {
  const mockBuildOutput = createFolderMap(buildOutput);
  const mockBuildOutputError = createFolderMap(buildOutputError);

  let mockContext: devkit.ExecutorContext;
  const mockOptions = {
    buildTarget: 'my-project:build-get',
    zipFileOutputPath: '/output/path',
    buildTargetOptions: {},
  };

  beforeEach(async () => {
    const tree = await createTestApp('my-project');
    const projectConfigurations = getProjectConfigurations(tree);
    const projectGraph = await createProjectGraphFromProjectConfiguration(
      projectConfigurations
    );
    mockContext = {
      root: '/',
      projectsConfigurations: {
        version: 1,
        projects: projectConfigurations,
      },
      projectGraph,
      projectName: 'my-project',
      targetName: 'package-get',
      cwd: '/',
      isVerbose: false,
      nxJsonConfiguration: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should package the handler and packages', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: true };
        })()
      );

    // Run the executor function
    const iterator = await packageExecutor(mockOptions, mockContext);

    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(2);
    expect(AdmZip).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1);
    expect(iterator['success']).toBe(true);
  });

  it('should package the handler and packages no NODE_ENV', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: true };
        })()
      );

    const env = process.env.NODE_ENV;

    delete process.env.NODE_ENV;
    const iterator = await packageExecutor(mockOptions, mockContext);
    process.env.NODE_ENV = env;

    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(2);
    expect(AdmZip).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1);
    expect(iterator['success']).toBe(true);
  });

  it('should package the handler and packages configurationName and no NODE_ENV', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: true };
        })()
      );
    const env = process.env.NODE_ENV;

    delete process.env.NODE_ENV;

    const iterator = await packageExecutor(mockOptions, {
      ...mockContext,
      configurationName: 'mock',
    });
    process.env.NODE_ENV = env;

    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(2);
    expect(AdmZip).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1);
    expect(iterator['success']).toBe(true);
  });

  it('should package the handler and packages no configurationName', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: true };
        })()
      );

    const iterator = await packageExecutor(mockOptions, {
      ...mockContext,
      configurationName: undefined,
    });

    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(2);
    expect(AdmZip).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1);
    expect(iterator['success']).toBe(true);
  });

  it('should handle build failure', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: false };
        })()
      );

    try {
      await packageExecutor(mockOptions, mockContext);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`Build failed. See above for errors.`);
    }
    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(0);
    expect(AdmZip).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(0);
  });

  it('should throw error on invalid build target', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();
    const loggerErrorMock = jest.spyOn(console, 'error').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    // Run the executor function
    const buildTarget = 'thiswillbe:anerror';
    try {
      await packageExecutor({ ...mockOptions, buildTarget }, mockContext);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        `Cannot find build target ${chalk.bold(
          buildTarget
        )} for project ${chalk.bold(mockContext.projectName)}`
      );
    }

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(0);
    expect(loggerErrorMock).toHaveBeenCalledTimes(0);

    expect(AdmZip).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(0);
  });

  it('should handle a file error', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();
    const loggerErrorMock = jest.spyOn(console, 'error').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutputError);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: true };
        })()
      );
    // Run the executor function
    const iterator = await packageExecutor(mockOptions, mockContext);

    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(2);
    expect(loggerErrorMock).toHaveBeenCalledTimes(1);

    expect(AdmZip).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1);
    expect(iterator['success']).toBe(true);
  });

  it('should handle executor throwing an error', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: false, done: true };
        })()
      );

    try {
      await packageExecutor(mockOptions, mockContext);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('Build failed. See above for errors.');
    }
    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(0);
    expect(AdmZip).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(0);
  });

  it('should handle no zipFileOutputPath', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    mockFs(mockBuildOutput);

    const mockRunExecutor = jest
      .spyOn(devkit, 'runExecutor')
      .mockResolvedValueOnce(
        (async function* () {
          yield { success: true };
        })()
      );

    // Run the executor function
    const iterator = await packageExecutor(
      { ...mockOptions, zipFileOutputPath: null },
      mockContext
    );

    // Assertions
    expect(mockRunExecutor).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(0);
    expect(loggerLogMock).toHaveBeenCalledTimes(0);
    expect(AdmZip).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(0);
    expect(iterator['success']).toBe(true);
  });
});

export async function createTestApp(libName: string): Promise<devkit.Tree> {
  const appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

  await applicationGenerator(appTree, {
    skipFormat: false,
    unitTestRunner: 'none',
    name: libName,
  });

  return appTree;
}

