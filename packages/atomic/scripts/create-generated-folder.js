const util = require('util');
const fs = require('fs');
const rm = util.promisify(fs.rm);
const mkdir = util.promisify(fs.mkdir);

async function createGeneratedFolder() {
  const generatedPath = 'src/generated';
  await rm(generatedPath, {recursive: true, force: true});
  await mkdir(generatedPath);
}

createGeneratedFolder();
