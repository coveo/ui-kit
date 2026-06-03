const pathlib = require('path');
const fs = require('fs');
const {quanticIsDependency, getProjectPath} = require('./utils');

function main() {
  if (!quanticIsDependency()) {
    return;
  }

  try {
    const projectDirectory = getProjectPath();
    fs.accessSync(
      pathlib.join(projectDirectory, 'sfdx-project.json'),
      fs.constants.R_OK
    );
  } catch (err) {
    console.error(
      'Quantic can only be installed in SFDX projects, please refer to this link for more information on how to create an SFDX project: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm'
    );
    console.error(err);
    process.exit(1);
  }
}

main();
