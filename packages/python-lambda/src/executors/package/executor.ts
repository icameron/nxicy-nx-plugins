import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@nx/devkit';
import { PackageExecutorSchema } from './schema';
import { ExecutorContext } from '@nrwl/devkit';
import * as AdmZip from 'adm-zip';

function addFolderToZip(folderPath: string, zip: AdmZip, parentPath: string) {
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
      addFolderToZip(subFolderPath, zip, subFolderRelativePath);
    }
  });
}

export default async function runExecutor(
  options: PackageExecutorSchema,
  context: ExecutorContext
) {
  const { packages, zipFilePath, extractPath, functionPath } = options;
  const systemRoot = context.root;

  // We want these paths to always be resolved relative to the workspace
  // root to be able to run the lint executor from any subfolder.
  process.chdir(systemRoot);

  const zip = new AdmZip();

  const zipFileOutputPath =
    path.join(systemRoot, zipFilePath) + '/function.zip';

  const relativePath = path.join(systemRoot, functionPath);
  const functionName=context.targetName.replace(/^package-/, '');

  logger.info(
    `Packaging ${chalk.green(functionName)} to ${chalk.green(
      zipFileOutputPath
    )}`
  );

  addFolderToZip(relativePath, zip, '');

  logger.log(`Adding Packages`);

  packages.forEach((folder) => {
    if (fs.existsSync(folder)) {
      logger.log(`+ ${chalk.green(folder)} `);
      addFolderToZip(folder, zip, '');
    } else {
      logger.error(`Folder '${folder}' does not exist.`);
    }
  });

  zip.writeZip(zipFileOutputPath);
  logger.log(`Zip file created: ${chalk.green(zipFileOutputPath)}`);

  if (extractPath !== '') {
    logger.log(
      `Extracting ${chalk.green(context.projectName)} to ${chalk.yellow(
        extractPath
      )}`
    );
    zip.extractAllTo(extractPath, true);
  }

  return {
    success: true,
  };
}
