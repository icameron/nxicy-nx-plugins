 //For copy
 export const mockFunctionFolder = {
    files: ['main'],
  };
  const mockPackage1Subfolder1 = {
    folderName: 'p1-subfolder-1',
    files: ['p1-subfolder-file-1.txt'],
  };

  export const mockPackage1 = {
    folderName: 'package1',
    files: ['p1-file1.txt', 'p1-file2.js', mockPackage1Subfolder1],
  };

  const mockPackage2Subfolder1Subfolder1 = {
    folderName: 'p2-subfolder1-subfolder1',
    files: [
      'p2-subfolder1-subfolder1-file2.txt',
      'p2-subfolder1-subfolder1-file1.txt',
    ],
  };
  const mockPackage2Subfolder1 = {
    folderName: 'p2-subfolder1',
    files: [
      'p2-subfolder1-file1.txt',
      'p2-subfolder1-file1.txt',
      mockPackage2Subfolder1Subfolder1,
    ],
  };
  const mockPackage2Subfolder2 = {
    folderName: 'p2-subfolder2',
    files: ['p2-subfolder2-file1.txt'],
  };

  export const mockPackage2 = {
    folderName: 'package2',
    files: [
      'p2-file1.txt',
      'p2-file2.js',
      mockPackage2Subfolder1,
      mockPackage2Subfolder2,
    ],
  };

  export const mockOutputFolderMainPackage1Package2 = {
    files: ['main', mockPackage1, mockPackage2],
  };

  export const mockOutputFolderMainPackage2 = {
    files: ['main', mockPackage2],
  };