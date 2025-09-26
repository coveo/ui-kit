const fs = require('fs');
const pathlib = require('path');
const {quanticIsDependency, getProjectPath} = require('./utils');

function copyFolder(source, target) {
  try {
    fs.cpSync(source, target, {recursive: true, force: true});
  } catch (err) {
    console.error(`Failed to copy folder at the following path ${source}`);
    console.error(err);
    process.exit(1);
  }
}

function createQuanticDirectory(path) {
  try {
    const quanticDirectoryPath = pathlib.join(path, 'quantic');
    if (!fs.existsSync(quanticDirectoryPath)) {
      fs.mkdirSync(quanticDirectoryPath);
    }
  } catch (err) {
    console.error('Failed to create Quantic directory.');
    console.error(err);
    process.exit(1);
  }
}

function getPackageDirectory(projectDirectory) {
  try {
    const sfdxProjectJson = require(
      pathlib.join(projectDirectory, 'sfdx-project.json')
    );
    const defaultPackageDirectory =
      sfdxProjectJson.packageDirectories.find(
        (directory) => directory.default
      ) || sfdxProjectJson.packageDirectories[0];
    return defaultPackageDirectory.path;
  } catch (err) {
    console.error('Failed to get the default package directory.');
    console.error(err);
    process.exit(1);
  }
}

function main() {
  if (!quanticIsDependency()) {
    return;
  }

  try {
    // path to source directory: project_name/node_modules/@coveo/quantic/force-app/main/default
    const sourceDirectory = pathlib.join(
      __dirname,
      '..',
      '..',
      'force-app',
      'main',
      'default'
    );

    const projectDirectory = getProjectPath();

    // the package directory is the directory to target when syncing source to and from an org.
    const defaultPackageDirectory = getPackageDirectory(projectDirectory);
    const defaultPackagePath = pathlib.join(
      projectDirectory,
      defaultPackageDirectory
    );
    const quanticDirectoryPath = pathlib.join(defaultPackagePath, 'quantic');

    createQuanticDirectory(defaultPackagePath);
    copyFolder(sourceDirectory, quanticDirectoryPath);
  } catch (err) {
    console.error('Failed to setup Quantic.');
    console.error(err);
    process.exit(1);
  }
}

main();
