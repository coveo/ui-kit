import {exec as execCb} from 'node:child_process';
import {promisify} from 'node:util';

console.log('Reloading...', new Date().toLocaleString());

const exec = promisify(execCb);

const execCommand = async (command, options) => {
  const {stdout, stderr} = await exec(command, options);
  if (stderr) throw new Error(stderr);
  return stdout.trim();
};

try {
  const result = await execCommand('npm test');
  console.log(result);
} catch (error) {
  console.error(error);
}
