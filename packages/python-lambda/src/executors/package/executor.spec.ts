import { libFilesMissing, libFiles } from '../../../__mocks__/package-files';
import { appFiles } from '../../../__mocks__/handler-files';
import runExecutor from './executor';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import { createFolderMap, mockFs } from '@nxicy/testing';

// Mock the dependencies
jest.mock('fs');
jest.mock('adm-zip');

describe('runExecutor', () => {
  const mockLibs = createFolderMap(libFiles);
  const mockLibsMissing = createFolderMap(libFilesMissing);
  
  const mockHandlerFiles = createFolderMap(appFiles);

  const mockOptions = {
    packages: ['libs/python/package1', 'libs/python/package2'],
    zipFileOutputPath: 'dist/app/project/handler',
    outputPath: 'dist/app/project',
    handlerPath: 'apps/project/src/handler',
  };

  const mockContext = {
    root: '/',
    targetName: 'package-get',
    cwd: './',
    isVerbose: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should package the handler and packages', async () => {
    // Mock the logger.info and logger.log methods
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();

    const mockFileSystem = {
      ...mockHandlerFiles,
      ...mockLibs,      
    };
    mockFs(mockFileSystem);

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    // Run the executor function
    const result = await runExecutor(mockOptions, mockContext);

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(2);
    expect(fs.copyFileSync).toHaveBeenCalledTimes(13); // Once for each package
    expect(AdmZip).toHaveBeenCalledTimes(1); // AdmZip constructor should be called once
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(13); // One for each package and the handler
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1); // writeZip should be called once for creating the zip file
    expect(result.success).toBe(true);
  });

  it('should handle a folder not existing', async () => {
    // Mock the logger.info and logger.log methods
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();
    const loggerLogError = jest.spyOn(console, 'error').mockImplementation();

    const mockFileSystem = {
      ...mockHandlerFiles,
      ...mockLibsMissing,
    };
    mockFs(mockFileSystem);

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    // Run the executor function
    const result = await runExecutor(mockOptions, mockContext);

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(2);
    expect(loggerLogError).toHaveBeenCalledTimes(1);
    expect(fs.copyFileSync).toHaveBeenCalledTimes(9);
    expect(AdmZip).toHaveBeenCalledTimes(1);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(9);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('should handle no zipFileOutputPath', async () => {
    const loggerInfoMock = jest.spyOn(console, 'info').mockImplementation();

    // Mock the AdmZip instance and its methods
    const admZipInstanceMock = {
      addFile: jest.fn(),
      writeZip: jest.fn(),
    };
    // Mock the AdmZip constructor to return the admZipInstanceMock
    (AdmZip as jest.Mock).mockImplementation(() => admZipInstanceMock);

    const mockFileSystem = {
      ...mockHandlerFiles,
      ...mockLibs
    };
    mockFs(mockFileSystem);

    // Run the executor function
    const result = await runExecutor(
      { ...mockOptions, zipFileOutputPath: null },
      mockContext
    );

    // Assertions
    expect(loggerInfoMock).toHaveBeenCalledTimes(1);
    expect(fs.copyFileSync).toHaveBeenCalledTimes(13); 
    expect(AdmZip).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(0);
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(0); 
    expect(result.success).toBe(true);
  });
});
