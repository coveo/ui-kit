const {ncp} = require('ncp');
const {resolve} = require('path');
const {readFileSync, writeFileSync} = require('fs');
const {cwd} = require('process');


ncp('./node_modules/@coveo/headless/', './headless/', function (err) {
  if (err) {
    return console.error(err);
  }

  const headlessPackageJsonPath = resolve(cwd(), 'headless/package.json');
  const headlessPackageJSON = JSON.parse(readFileSync(headlessPackageJsonPath));
  headlessPackageJSON.private = true;
  writeFileSync(
    headlessPackageJsonPath,
    JSON.stringify(headlessPackageJSON, undefined, 2) + '\n'
  );
  
  console.log('Headless files copied!');
});
