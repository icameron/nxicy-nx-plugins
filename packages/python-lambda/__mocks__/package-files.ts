const package2DirSubDir1SubDir1 = [
    {
      name: 'package2-subdir1-file1.py',
      isFile: true,
      contents: 'package2-subdir1-file1',
    },
    {
      name: 'package2-subdir1-file2.py',
      isFile: true,
      contents: 'package2-subdir1-file2',
    },
  ];
  
  const package2DirSubDir1 = [
    {
      name: 'package2-subdir1-file1.py',
      isFile: true,
      contents: 'package2-subdir1-file1',
    },
    {
      name: 'package2-subdir1-file2.py',
      isFile: true,
      contents: 'package2-subdir1-file2',
    },
    {
      name: 'package2-subdir1-subdir1',
      isFile: false,
      contents: package2DirSubDir1SubDir1,
    },
  ];
  
  const package2DirSubDir2 = [
    {
      name: 'package2-subdir2-file1.py',
      isFile: true,
      contents: 'package2-subdir2-file1',
    },
    {
      name: 'package2-subdir2-file2.py',
      isFile: true,
      contents: 'package2-subdir2-file2',
    },
  ];
  
  const package2Dir = [
    { name: 'package2-file1.py', isFile: true, contents: 'package1-file1' },
    { name: 'package2-file2.py', isFile: true, contents: 'package1-file2' },
    { name: 'package2-subdir1', isFile: false, contents: package2DirSubDir1 },
    { name: 'package2-subdir2', isFile: false, contents: package2DirSubDir2 },
  ];
  
  const package1DirSubDir1 = [
    {
      name: 'package1-subdir1-file1.py',
      isFile: true,
      contents: 'package1-subdir1-file1',
    },
    {
      name: 'package1-subdir1-file2.py',
      isFile: true,
      contents: 'package1-subdir1-file2',
    },
  ];
  
  const package1Dir = [
    { name: 'package1-file1.py', isFile: true, contents: 'package1-file1' },
    { name: 'package1-file2.py', isFile: true, contents: 'package1-file2' },
    { name: 'package1-subdir1', isFile: false, contents: package1DirSubDir1 },
  ]

  export const package1=[{
   name:'package1' ,
   isFile:false,
   contents:package1Dir

  }]
  export const package2=[{
    name:'package2' ,
    isFile:false,
    contents:package2Dir
 
   }]