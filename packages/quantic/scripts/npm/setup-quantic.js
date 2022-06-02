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
    console.error(err);
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
    console.error(err);
    process.exit(1);
  }
}

function quanticIsDependency() {
  const upperDirectories = __dirname.split(pathlib.sep);
  const firstTwoUpperDirectories = upperDirectories.slice(
    upperDirectories.length - 5
  );
  return (
    firstTwoUpperDirectories.join(pathlib.sep) ===
    pathlib.join('node_modules', '@coveo', 'quantic', 'scripts', 'npm')
  );
}

function getProjectPath() {
  return __dirname.split('/node_modules')[0];
}

function main() {
  try {
    if (quanticIsDependency()) {
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
      copyFolderRecursiveSync(sourceDirectory, quanticDirectoryPath);
    }
  } catch (err) {
    console.error('Failed to setup Quantic.');
    console.error(err);
    process.exit(1);
  }
}

main();
