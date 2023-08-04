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
    const loggerInfoMock = jest.spyOn(console, 'info');
    const loggerLogMock = jest.spyOn(console, 'log');


    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.copyFileSync as jest.Mock).mockReturnValue(true);


    //Mock package1 -f,f,d,f
    (fs.readdirSync as jest.Mock).mockReturnValueOnce([
      'p1-file1.txt',
      'p1-file2.js',
      'p1-folder1',
    ]).mockReturnValueOnce([
      'p1-sub-file1.txt',      
    ]);
    (fs.statSync as jest.Mock).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => false,
      isDirectory: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    }));
   
   
    //Mock package1  - f,f,d,f,d,f,d,f,f
    (fs.readdirSync as jest.Mock).mockReturnValueOnce([
      'p2-file1.txt',
      'p2-file2.js',
      'p2-folder1',
      'p2-folder2',
    ]).mockReturnValueOnce([
      'p2-sub-file1.txt', 
      'p2-sub-folder1',     
    ]).mockReturnValueOnce([
      'p2-sub-folder1-file2.txt',      
    ]).mockReturnValueOnce([
      'p2-sub-folder2-file1.txt',      
      'p2-sub-folder2-file1.txt',      
    ]);
    //f,f,d,f,d,f,d,f,f
    (fs.statSync as jest.Mock).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => false,
      isDirectory: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => false,
      isDirectory: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => false,
      isDirectory: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isFile: () => true,
    }));
    

    // mock main folder -f 
    (fs.readdirSync as jest.Mock).mockReturnValueOnce([
      'main.txt',      
    ]);
    (fs.statSync as jest.Mock).mockImplementationOnce(() => ({
      isFile: () => true,
    }));
    

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
    expect(loggerLogMock).toHaveBeenCalledTimes(2);
    expect(fs.existsSync).toHaveBeenCalledTimes(3); // One for each package and the handler
    expect(fs.copyFileSync).toHaveBeenCalledTimes(2); // Once for each package
    expect(AdmZip).toHaveBeenCalledTimes(1); // AdmZip constructor should be called once
    expect(admZipInstanceMock.addFile).toHaveBeenCalledTimes(3); // One for each package and the handler
    expect(admZipInstanceMock.writeZip).toHaveBeenCalledTimes(1); // writeZip should be called once for creating the zip file
    expect(result.success).toBe(true);
  });

  // You can add more test cases for different scenarios if needed.
});
