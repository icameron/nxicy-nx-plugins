import { buildFileAndFolderMockOrder } from '../../../../../__mocks__/utils/buildFileAndFolderMockOrder';
import { mockFunctionFolder,mockPackage1 ,mockPackage2,mockOutputFolderMainPackage1Package2,mockOutputFolderMainPackage2} from '../../../../../__mocks__/mockFilesAndFolders';
import runExecutor from './executor';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';

// Mock the dependencies
jest.mock('fs');
jest.mock('adm-zip');


describe('runExecutor', () => {
 
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should package the handler and packages', async () => {
    // Mock the inputs for options and context
    const mockOptions = {
      packages: ['/package1', '/package2'],
      zipFileOutputPath: '/output/path',
      outputPath: '/output/path',
      handlerPath: '/handler/path',
    };

    // Mock the logger.info and logger.log methods
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.copyFileSync as jest.Mock).mockReturnValue(true);

    buildFileAndFolderMockOrder(mockFunctionFolder);
    buildFileAndFolderMockOrder(mockPackage1);
    buildFileAndFolderMockOrder(mockPackage2);
    buildFileAndFolderMockOrder(mockOutputFolderMainPackage1Package2);

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    const mockContext = {
      root: '/',
      targetName: 'package-get',
      cwd: './',
      isVerbose: false,
    };
    // Run the executor function
    const result = await runExecutor(mockOptions, mockContext);

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(2);
 //   expect(loggerLogMock).toHaveBeenCalledTimes(14);
    expect(fs.copyFileSync).toHaveBeenCalledTimes(11); // Once for each package
    expect(AdmZip).toHaveBeenCalledTimes(1); // AdmZip constructor should be called once
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(11); // One for each package and the handler
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1); // writeZip should be called once for creating the zip file
    expect(result.success).toBe(true);
  });

  it('should handle a folder not existing', async () => {
    // Mock the inputs for options and context
    const mockOptions = {
      packages: ['/package1', '/package2'],
      zipFileOutputPath: '/output/path',
      outputPath: '/output/path',
      handlerPath: '/handler/path',
    };

    // Mock the logger.info and logger.log methods
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();
    const loggerLogError = jest.spyOn(console, 'error').mockImplementation();

    (fs.existsSync as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    (fs.copyFileSync as jest.Mock).mockReturnValue(true);

    buildFileAndFolderMockOrder(mockFunctionFolder);
    buildFileAndFolderMockOrder(mockPackage2);
    buildFileAndFolderMockOrder(mockOutputFolderMainPackage2);

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    const mockContext = {
      root: '/',
      targetName: 'package-get',
      cwd: './',
      isVerbose: false,
    };
    // Run the executor function
    const result = await runExecutor(mockOptions, mockContext);

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(2);
  //  expect(loggerLogMock).toHaveBeenCalledTimes(10);
    expect(loggerLogError).toHaveBeenCalledTimes(1);
    expect(fs.copyFileSync).toHaveBeenCalledTimes(8); // Once for each package
    expect(AdmZip).toHaveBeenCalledTimes(1); // AdmZip constructor should be called once
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(8); // One for each package and the handler
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1); // writeZip should be called once for creating the zip file
    expect(result.success).toBe(true);
  });

  it('should handle no zipFileOutputPath', async () => {
    // Mock the inputs for options and context
    const mockOptions = {
      packages: ['/package1', '/package2'],
      zipFileOutputPath: null,
      outputPath: '/output/path',
      handlerPath: '/handler/path',
    };

    // Mock the logger.info and logger.log methods
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogMock = jest.spyOn(console, 'log').mockImplementation();

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.copyFileSync as jest.Mock).mockReturnValue(true);

    buildFileAndFolderMockOrder(mockFunctionFolder);
    buildFileAndFolderMockOrder(mockPackage1);
    buildFileAndFolderMockOrder(mockPackage2);

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    const mockContext = {
      root: '/',
      targetName: 'package-get',
      cwd: './',
      isVerbose: false,
    };
    // Run the executor function
    const result = await runExecutor(mockOptions, mockContext);

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(1);
    //expect(loggerLogMock).toHaveBeenCalledTimes(12);
    expect(fs.copyFileSync).toHaveBeenCalledTimes(11); // Once for each package
    expect(AdmZip).toHaveBeenCalledTimes(0); // AdmZip constructor should be called once
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0); // One for each package and the handler
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(0); // writeZip should be called once for creating the zip file
    expect(result.success).toBe(true);
  });
});
