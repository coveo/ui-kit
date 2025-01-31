import chalk from 'chalk';
import {exec} from 'node:child_process';
import {watch} from 'node:fs';
import net from 'node:net';
import ora from 'ora';

let runningProcesses = [];
let isStopped = false;
let storybookServer;

async function nextTask(text, command) {
  const frames = ['⚽  🐕  ', ' ⚽ 🐕  ', '  ⚽🐕  ', ' ⚽🐕   ', '⚽ 🐕   '];
  const spinner = ora({
    text: text,
    spinner: {frames, interval: 200},
  }).start();

  return new Promise((resolve, reject) => {
    const childProcess = exec(command, {stdio: 'inherit'});

    runningProcesses.push(childProcess);

    childProcess.on('exit', (code) => {
      runningProcesses = runningProcesses.filter((p) => p !== childProcess);

      if (code === 0) {
        spinner.succeed(chalk.magenta.bold(`${text}`));
        resolve();
      } else {
        spinner.fail(chalk.red.bold(`${text}`));
      }
    });

    childProcess.on('error', (error) => {
      spinner.fail(chalk.red.bold(`${text}`));
      reject(error);
    });
  });
}

async function stopAllProcesses() {
  isStopped = true;

  runningProcesses.forEach((process) => {
    if (process && process.kill) {
      process.kill('SIGTERM');
    }
  });

  runningProcesses = [];

  // Wait briefly to ensure processes terminate before restarting the build
  await new Promise((resolve) => setTimeout(resolve, 100));
}

function waitForPort(port, host = 'localhost', timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function check() {
      const socket = net.createConnection(port, host);
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.on('timeout', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(check, 500);
        }
      });
    }

    check();
  });
}

async function startServers() {
  console.log(chalk.green.bold('🚀 Starting development servers...'));

  storybookServer = exec('npx storybook dev -p 4400 --no-open', {
    stdio: 'ignore',
  });

  // Script that starts the Vite server and copies files for CDN mode
  exec('node ./scripts/start-dev.mjs', {stdio: 'ignore'});

  console.log(
    chalk.yellow('⌛ Waiting for Storybook (4400) and Vite (3333)...')
  );
  await Promise.all([waitForPort(4400), waitForPort(3333)]);

  console.log(chalk.blue.bold('✅ Servers started! Watching for changes...'));
}

// Start the servers first
startServers();

const [isStencil] = process.argv.slice(2);

// Watch the src folder for changes
watch('src', {recursive: true}, async (_, filename) => {
  console.log(isStencil);
  await stopAllProcesses();
  console.log(chalk.cyanBright(`📂 File changed: ${filename}`));

  isStopped = false;

  if (isStencil) {
    await nextTask(
      'Rebuilding Stencil...',
      'node --max_old_space_size=6144 ../../node_modules/@stencil/core/bin/stencil build --tsConfig tsconfig.stencil.json'
    );

    if (isStopped) {
      return;
    }

    await nextTask(
      'Placing the Stencil Proxy...',
      'node ./scripts/stencil-proxy.mjs'
    );

    if (isStopped) {
      return;
    }
  }

  await nextTask(
    'Rebuilding Lit...',
    'node ./scripts/build.mjs --config=tsconfig.lit.json'
  );

  if (isStopped) {
    return;
  }

  await nextTask(
    'Processing CSS...',
    'node ./scripts/process-css.mjs --config=tsconfig.lit.json'
  );

  if (isStopped) {
    return;
  }

  await nextTask(
    'Running esbuild for autoloader ESM...',
    'esbuild src/autoloader/index.ts --format=esm --outfile=dist/atomic/autoloader/index.esm.js'
  );

  if (isStopped) {
    return;
  }

  await nextTask(
    'Running esbuild for autoloader CJS...',
    'esbuild src/autoloader/index.ts --format=cjs --outfile=dist/atomic/autoloader/index.cjs.js'
  );

  if (isStopped) {
    return;
  }

  await nextTask('Building storybook', 'npx storybook build -o dist-storybook');
  // restart storybook server, somehow even after build, it doesn't pick up the changes
  // it needs a dev restart to pick up the changes
  storybookServer.kill('SIGTERM');
  exec('npx storybook dev -p 4400 --no-open', {stdio: 'ignore'});

  if (isStopped) {
    return;
  }

  console.log(chalk.magenta.bold(' 🎇 Build process completed! 🎇 '));
});
