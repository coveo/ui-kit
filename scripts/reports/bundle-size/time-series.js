const {existsSync, writeFileSync, appendFileSync} = require('fs');
const {computeFileSizes} = require('./command');

const branch = process.env.GIT_BRANCH;
const fileName = 'bundle-size-time-series.csv';

function isMasterBranch() {
  return branch === 'origin/master';
}

function dataFileExists() {
  const exists = existsSync(fileName);
  exists ? console.log('data file found') : console.log('data file not found');
  return exists;
}

function initDataFile() {
  console.log('creating data file');
  writeFileSync(fileName, '"minified","gzipped"');
}

async function prepareData() {
  const data = await getData();
  const {minified, gzipped} = data;
  return `\n${minified},${gzipped}`;
}

async function getData() {
  const slash = isWindows() ? '\\' : '/';
  const bundleName = `dist${slash}browser${slash}headless.esm.js`;

  const sizes = await computeFileSizes();
  const data = sizes[bundleName];

  if (!data) {
    throw new Error(`failed to retrieve data for bundle: ${bundleName}`);
  }

  return data;
}

function isWindows() {
  return process.platform === 'win32';
}

function appendToDataFile(row) {
  appendFileSync(fileName, row);
}

async function main() {
  if (!isMasterBranch()) {
    return console.log(`cancelling build on branch: ${branch}`);
  }

  if (!dataFileExists()) {
    initDataFile();
  }

  const data = await prepareData();
  appendToDataFile(data);
}

main();
