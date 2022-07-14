const {resolve} = require('path');
const {readFileSync, writeFileSync} = require('fs');
const {cwd} = require('process');
const {packageDirsSnyk} = require('../packages');
const packageJsonPath = resolve(cwd(), 'package.json');

const packageJSON = JSON.parse(readFileSync(packageJsonPath));
packageJSON.workspaces = packageJSON.workspaces.filter((wp) =>
  packageDirsSnyk.map((dir) => `packages/${dir}`).includes(wp)
);
writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJSON, undefined, 2) + '\n'
);
