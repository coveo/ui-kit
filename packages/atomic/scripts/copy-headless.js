const util = require('util');
const fs = require('fs');
const ncp = util.promisify(require('ncp'));
const readFile = util.promisify(fs.readFile);
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

async function copyHeadless() {
  const headlessPath = '../headless/';
  const copiedHeadlessPath = './headless/';
  const headlessPackageJsonPath = `${headlessPath}package.json`;
  const headlessPackageJSONData = await readFile(headlessPackageJsonPath);
  const files = [
    ...JSON.parse(headlessPackageJSONData).files,
    'package.json',
    'LICENSE',
  ];

  if (!(await exists(copiedHeadlessPath))) {
    await mkdir(copiedHeadlessPath);
  }

  for (const file of files) {
    await ncp(`${headlessPath}${file}`, `${copiedHeadlessPath}${file}`);
  }
}

copyHeadless();
