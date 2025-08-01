const {unlinkSync, readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const {getPackageManager} = require('./utils');
const pkgJson = JSON.parse(readFileSync('package.json'));

['postinstall', 'setup-cleanup'].forEach(
  (script) => delete pkgJson['scripts'][script]
);

const pkgString = JSON.stringify(pkgJson, null, 2).replace(
  /npm/g,
  getPackageManager(true)
);

writeFileSync('package.json', pkgString);

['clean-up.js', 'utils.js'].forEach((file) =>
  unlinkSync(join(__dirname, file))
);
