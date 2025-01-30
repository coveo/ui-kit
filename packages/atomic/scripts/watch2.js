import chalk from 'chalk';
import {exec} from 'node:child_process';
import {watch} from 'node:fs';
import ora from 'ora';

let runningProcesses = [];
let isStopped = false;
let currentTask = null;

function runCommand(command) {
  return new Promise((resolve, reject) => {
    if (isStopped) {
      return resolve();
    }

    const process = exec(command);
    runningProcesses.push(process);

    process.stdout.on('data', (data) => console.log(chalk.green(data)));
    process.stderr.on('data', (data) => console.error(chalk.red(data)));

    process.on('close', (code, signal) => {
      runningProcesses = runningProcesses.filter((p) => p !== process);

      if (isStopped || signal === 'SIGTERM' || signal === 'SIGINT') {
        console.log(chalk.yellow(`⚠️ Process for "${command}" was stopped.`));
        return resolve();
      }

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (err) => {
      if (isStopped) {
        return resolve();
      }
      reject(err);
    });
  });
}

function funkyAnimation(text) {
  if (isStopped) {
    return Promise.resolve();
  }

  const frames = ['🍎', '🚀', '🔥', '💥', '✨', '🌟', '🎉', '🍏'];
  const spinner = ora({
    text: text,
    spinner: {frames, interval: 200},
  }).start();

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!isStopped) {
        spinner.succeed(chalk.magenta.bold(`${text} ✅`));
      }
      resolve();
    }, 3000);
  });
}

async function stopAllProcesses() {
  console.log(chalk.red('🛑 Stopping all running processes...'));
  isStopped = true;

  runningProcesses.forEach((process) => {
    if (process && process.kill) {
      process.kill('SIGTERM');
    }
  });

  runningProcesses = [];
  currentTask = null;

  // Wait briefly to ensure processes terminate before restarting the build
  await new Promise((resolve) => setTimeout(resolve, 100));
}

watch('src', {recursive: true}, async (eventType, filename) => {
  await stopAllProcesses(); // Ensure all previous tasks are stopped before continuing

  console.log(chalk.cyanBright(`📂 File changed: ${filename}`));
  console.log(chalk.yellowBright(`🔄 Event Type: ${eventType}`));

  isStopped = false; // Allow execution again

  try {
    currentTask = funkyAnimation('🍎 Rebuilding Stencil...');
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = runCommand(
      'node --max_old_space_size=6144 ../../node_modules/@stencil/core/bin/stencil build --tsConfig tsconfig.stencil.json'
    );
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = funkyAnimation('🍏 Placing the Stencil Proxy...');
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = runCommand('node ./scripts/stencil-proxy.mjs');
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = funkyAnimation('🚀 Running esbuild for autoloader ESM...');
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = runCommand(
      'esbuild src/autoloader/index.ts --format=esm --outfile=dist/atomic/autoloader/index.esm.js'
    );
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = funkyAnimation('🔥 Running esbuild for autoloader CJS...');
    await currentTask;
    if (isStopped) {
      return;
    }

    currentTask = runCommand(
      'esbuild src/autoloader/index.ts --format=cjs --outfile=dist/atomic/autoloader/index.cjs.js'
    );
    await currentTask;
    if (isStopped) {
      return;
    }

    console.log(chalk.bold.bgMagenta(' 🎇 Build process completed! 🎇 '));
  } catch (error) {
    console.log(chalk.red(`❌ Build process failed: ${error.message}`));
  }
});
