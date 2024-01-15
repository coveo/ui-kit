import {execa} from 'execa';
import {readdirSync} from 'node:fs';

const dir = './config/api-extractor';

async function main() {
  const paths = readdirSync(dir)
    .filter((file) => file !== 'base.json')
    .map((file) => `${dir}/${file}`);
  console.log('extracting documentation using', paths);

  const jobs = paths.map((path) => {
    const apiProcess = execa('api-extractor', ['run', '-l', '-c', path], {});
    apiProcess.stdout.pipe(process.stdout);
    apiProcess.stderr.pipe(process.stderr);
    return apiProcess;
  });
  await Promise.all(jobs);
}

main();
