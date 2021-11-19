const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function setHeadlessPrivate() {
  const headlessPackageJsonPath = 'headless/package.json';
  const headlessPackageJSONData = await readFile(headlessPackageJsonPath);
  const headlessPackageData = JSON.parse(headlessPackageJSONData);

  headlessPackageData.private = true;

  await writeFile(
    headlessPackageJsonPath,
    JSON.stringify(headlessPackageData, undefined, 2) + '\n'
  );
}

setHeadlessPrivate();
