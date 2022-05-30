const fs = require('fs');
const pathlib = require('path');

function copyFileSync(source, target) {
  try {
    let targetFile = target;
    if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
      targetFile = pathlib.join(target, pathlib.basename(source));
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  } catch (err) {
    console.error(`Failed to copy file at the following path ${source}`);
    process.exit(1);
  }
}

function copyFolderRecursiveSync(source, target) {
  try {
    const targetFolder = pathlib.join(target, pathlib.basename(source));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder);
    }

    if (fs.lstatSync(source).isDirectory()) {
      const files = fs.readdirSync(source);
      files.forEach(function (file) {
        let sourceFilePath = pathlib.join(source, file);
        if (fs.lstatSync(sourceFilePath).isDirectory()) {
          copyFolderRecursiveSync(sourceFilePath, targetFolder);
        } else {
          copyFileSync(sourceFilePath, targetFolder);
        }
      });
    }
  } catch (err) {
    console.error(`Failed to copy folder at the following path ${source}`);
    process.exit(1);
  }
}

function createQuanticDirectory(path) {
  try {
    const quanticDirectoryPath = pathlib.join(path, 'quantic');
    if (fs.existsSync(quanticDirectoryPath)) {
      fs.rmdirSync(quanticDirectoryPath, {recursive: true});
    }
    fs.mkdirSync(quanticDirectoryPath);
  } catch (err) {
    console.error('Failed to create Quantic directory');
    process.exit(1);
  }
}

function getPackageDirectory(projectDirectory) {
  try {
    const sfdxProjectJson = fs.readFileSync(
      pathlib.join(projectDirectory, 'sfdx-project.json')
    );
    const sfdxProjectObject = JSON.parse(sfdxProjectJson);
    const defaultPackageDirectory =
      sfdxProjectObject.packageDirectories.find(
        (directory) => directory.default
      ) || sfdxProjectObject.packageDirectories[0];
    return defaultPackageDirectory.path;
  } catch (err) {
    console.error('Failed to get the default package directory.');
    process.exit(1);
  }
}

function getGrandParentPath(path) {
  const directories = path.split(pathlib.sep);
  return directories.slice(0, directories.length - 2).join(pathlib.sep);
}

function main() {
  try {
    const sourceDirectory = pathlib.join(
      __dirname,
      'force-app',
      'main',
      'default'
    );
    const translationsDirectory = pathlib.join(
      __dirname,
      'force-app',
      'main',
      'translations'
    );
    const projectDirectory = getGrandParentPath(__dirname);
    const defaultPackageDirectory = getPackageDirectory(projectDirectory);
    const defaultPackagePath = pathlib.join(
      projectDirectory,
      defaultPackageDirectory
    );
    const quanticDirectoryPath = pathlib.join(defaultPackagePath, 'quantic');

    createQuanticDirectory(defaultPackagePath);
    copyFolderRecursiveSync(sourceDirectory, quanticDirectoryPath);
    copyFolderRecursiveSync(translationsDirectory, quanticDirectoryPath);
  } catch (err) {
    console.error('Failed to setup Quantic.');
    process.exit(1);
  }
}

main();
