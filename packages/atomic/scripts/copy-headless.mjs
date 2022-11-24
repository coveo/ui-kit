import fs from 'fs';
import _ncp from 'ncp';
import {promisify} from 'util';

const ncp = promisify(_ncp);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

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
