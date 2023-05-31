import {execa} from 'execa';
import {readdirSync} from 'node:fs';
import padStream from 'pad-stream';

const dir = './config/api-extractor';

async function main() {
  const paths = readdirSync(dir)
    .filter((file) => file !== 'base.json')
    .map((file) => `${dir}/${file}`);
  console.log('extracting documentation using', paths);

  const jobs = paths.map((path) => {
    const apiProcess = execa('api-extractor', ['run', '-l', '-c', path], {});
    const streamPrefix = path.split('/').pop().split('.json').shift() + ':\t';
    apiProcess.stdout.pipe(padStream(1, streamPrefix)).pipe(process.stdout);
    apiProcess.stderr.pipe(padStream(1, streamPrefix)).pipe(process.stderr);
    return apiProcess;
  });
  await Promise.all(jobs);
}

main();
