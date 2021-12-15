const { existsSync, writeFileSync, appendFileSync } = require('fs')
const { computeFileSizes } = require('./command');

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
  return `\n${data}`;
}

async function getData() {
  const useCase = 'search';
  const sizes = await computeFileSizes();
  const data = sizes[useCase];
  
  if (!data) {
    throw new Error(`failed to retrieve data for bundle: ${useCase}`)
  }

  return data;
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