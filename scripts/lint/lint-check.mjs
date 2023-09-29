import {exec} from 'child_process';

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

async function main() {
  try {
    await runCommand('npx eslint .');

    // also make it with npx
    await runCommand('npm run lint:spell');

    // await runCommand('npx prettier --check .');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
