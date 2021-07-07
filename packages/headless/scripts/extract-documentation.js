const {promisify} = require('util');
const {} = require('path');
const exec = promisify(require('child_process').exec);

const configFiles = [
  'search.json',
  'recommendation.json'
]

async function main() {
  const jobs = configFiles.map(file => exec(`api-extractor run -l -c ./config/api-extractor/${file}`))
  await Promise.all(jobs);
}

main();