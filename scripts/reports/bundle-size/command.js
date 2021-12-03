const {resolve} = require('path');
const {readFileSync} = require('fs');

function computeFileSizes() {
  console.log('getting file sizes');
  const path = resolve('packages/headless/.size-snapshot.json');
  const buffer = readFileSync(path);
  return JSON.parse(buffer.toString());
}

module.exports = {computeFileSizes};
