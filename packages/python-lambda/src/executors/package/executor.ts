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
      fs.copyFileSync(outputPath, fileRelativePath);
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
  packages.forEach((folder) => {
    if (fs.existsSync(folder)) {
      logger.log(`+ ${chalk.green(folder)} `);
      addFolderToOutputPath(outputPath, folder);
    } else {
      logger.error(`Folder '${folder}' does not exist.`);
    }
  });


  if (zipFileOutputPath) {
    const zip = new AdmZip();

    const zipFilePath =
      path.join(systemRoot, zipFileOutputPath) + '/handler.zip';

    logger.info(
      `Packaging ${chalk.green(handlerName)} to ${chalk.green(zipFilePath)}`
    );

    addFolderToZip(zip, outputPath);

    zip.writeZip(zipFileOutputPath);
    logger.log(`Zip file created: ${chalk.green(zipFilePath)}`);
  }
  return {
    success: true,
  };
}