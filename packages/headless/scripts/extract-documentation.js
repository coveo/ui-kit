const {promisify} = require('util');
const {readdirSync} = require('fs')
const exec = promisify(require('child_process').exec);

const dir = './config/api-extractor';

async function main() {
  const paths = readdirSync(dir).filter(file => file !== 'base.json').map(file => `${dir}/${file}`);
  console.log('extracting documentation using', paths);
  
  const jobs = paths.map(path => exec(`api-extractor run -l -c ${path}`))
  await Promise.all(jobs);
}

main();