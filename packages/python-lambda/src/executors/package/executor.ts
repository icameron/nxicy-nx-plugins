import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@nx/devkit';
import { PackageExecutorSchema } from './schema';
import { ExecutorContext } from '@nrwl/devkit';
import * as AdmZip from 'adm-zip';

function addFolderToZip(zip: AdmZip, folderPath: string, parentPath = '') {
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const fileRelativePath = path.join(parentPath, file).replace(/\\/g, '/');
      const fileContent = fs.readFileSync(filePath);
      zip.addFile(fileRelativePath, fileContent);
    } else if (stat.isDirectory()) {
      const subFolderPath = path.join(folderPath, file);
      const subFolderRelativePath = path.join(parentPath, file);
      addFolderToZip(zip, subFolderPath, subFolderRelativePath);
    }
  });
}

function addFolderToOutputPath(
  outputPath: string,
  folderPath: string,
  parentPath = ''
) {
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const fileRelativePath = path.join(parentPath, file).replace(/\\/g, '/');
      const destPath = path.join(outputPath, fileRelativePath);
      const targetFolder = path.dirname(destPath);
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }
      fs.copyFileSync(filePath, destPath);
    } else if (stat.isDirectory()) {
      const subFolderPath = path.join(folderPath, file);
      const subFolderRelativePath = path.join(parentPath, file);
      addFolderToOutputPath(outputPath, subFolderPath, subFolderRelativePath);
    }
  });
}

export default async function runExecutor(
  options: PackageExecutorSchema,
  context: ExecutorContext
) {
  const { packages, zipFileOutputPath, outputPath, handlerPath } = options;
  const systemRoot = context.root;

  // We want these paths to always be resolved relative to the workspace
  // root to be able to run the lint executor from any subfolder.
  process.chdir(systemRoot);
  const relativePath = path.join(systemRoot, handlerPath);

  const handlerName = context.targetName.replace(/^package-/, '');

  logger.info(
    `Packaging ${chalk.green(handlerName)} to ${chalk.green(outputPath)}`
  );
  addFolderToOutputPath(outputPath, relativePath);
  // Note this root of the package and python files it's subfolder
  packages.forEach((folder) => {
    const relativeFolder = path.join(systemRoot, folder);
    if (fs.existsSync(relativeFolder)) {
      logger.log(`+ ${chalk.green(relativeFolder)} `);
      addFolderToOutputPath(outputPath, relativeFolder);
    } else {
      logger.error(`Folder '${relativeFolder}' does not exist.`);
    }
  });

  if (zipFileOutputPath) {
    const zip = new AdmZip();

    const zipFilePath =
      path.join(systemRoot, zipFileOutputPath) + path.sep + 'handler.zip';

    logger.info(
      `Packaging ${chalk.green(handlerName)} to ${chalk.green(zipFilePath)}`
    );

    addFolderToZip(zip, outputPath);   
     
    const targetFolder = path.dirname(zipFilePath);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    zip.writeZip(zipFilePath);
    logger.log(`Zip file created: ${chalk.green(zipFilePath)}`);
  }
  return {
    success: true,
  };
}
