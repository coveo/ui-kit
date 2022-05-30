const pathlib = require('path');
const fs = require('fs');

function getGrandParentPath(path) {
  const directories = path.split(pathlib.sep);
  return directories.slice(0, directories.length - 2).join(pathlib.sep);
}

function main() {
  try {
    const projectDirectory = getGrandParentPath(__dirname);
    fs.accessSync(
      pathlib.join(projectDirectory, 'sfdx-project.json'),
      fs.constants.F_OK
    );
  } catch (err) {
    console.error(
      'Quantic can only be installed in SFDX projects, please refer to this link for more information on how to create an SFDX project: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm'
    );
    process.exit(1);
  }
}

main();
