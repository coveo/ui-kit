import chalk from 'chalk';
import {exec} from 'node:child_process';
import {watch} from 'node:fs';
import net from 'node:net';
import ora from 'ora';
import waitOn from 'wait-on';

/**
 * An array to keep track of running processes.
 * @type {Array<import('node:child_process').ChildProcess>}
 */
let runningProcesses = [];
/**
 * A flag to stop the build process if a file changes during the build.
 * @type {boolean}
 */
let isStopped = false;
/**
 * @type {import('node:child_process').ChildProcess}
 */
let storybookServer;

/**
 * Executes a command as a child process with a spinner animation.
 *
 * @param {string} text - The text to display alongside the spinner.
 * @param {string} command - The command to execute in the child process.
 * @returns {Promise<void>} A promise that resolves when the command completes successfully, or rejects if an error occurs.
 */
async function nextTask(text, command) {
  const frames = ['⚽  🐕  ', ' ⚽ 🐕  ', '  ⚽🐕  ', ' ⚽🐕   ', '⚽ 🐕   '];
  const spinner = ora({
    text: text,
    spinner: {frames, interval: 200},
  }).start();

  return new Promise((resolve, reject) => {
    const childProcess = exec(command, {stdio: 'inherit'});

    // Add the process to the list of running processes to be able to stop them
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
  await new Promise((resolve) => setTimeout(resolve, 300));
}

/**
 * Waits for a specific port to be available on the given host using wait-on.
 *
 * @param {number} port - The port number to check.
 * @param {string} [host='localhost'] - The host to check the port on.
 * @param {number} [timeout=30000] - The maximum time to wait for the port to be available, in milliseconds.
 * @returns {Promise<void>} A promise that resolves when the port is available, or rejects if the timeout is reached.
 */
async function waitForPort(port, host = 'localhost', timeout = 30000) {
  const resource = `tcp:${host}:${port}`;
  try {
    await waitOn({
      resources: [resource],
      timeout,
      tcpTimeout: 1000,
      interval: 500,
    });
  } catch (error) {
    throw new Error(`Timeout waiting for port ${port} on ${host}`);
  }
}

async function startServers() {
  console.log(chalk.green.bold('🚀 Starting development servers...'));

  storybookServer = exec('npx storybook dev -p 4400 --no-open', {
    stdio: 'ignore',
  });

  // Script that starts the Vite server and copies files for CDN mode
  exec('node ./scripts/start-vite.mjs', {stdio: 'ignore'});

  console.log(
    chalk.yellow('⌛ Waiting for Storybook (4400) and Vite (3333)...')
  );
  await Promise.all([waitForPort(4400), waitForPort(3333)]);

  console.log(chalk.blue.bold('✅ Servers started! Watching for changes...'));
}

// Get the stencil flag
const isStencil = process.argv.includes('--stencil');

// Start the servers (vite & storybook) first
startServers();

// Watch the src folder for changes
watch('src', {recursive: true}, async (_, filename) => {
  // Ignore irrelevant files
  if (
    filename.endsWith('.mdx') ||
    filename.endsWith('.new.stories.tsx') ||
    filename.endsWith('.spec.ts') ||
    filename.includes('e2e')
  ) {
    return;
  }

  // Stop all processes if a file changes to prevent multiple builds at once
  await stopAllProcesses();
  console.log(chalk.cyanBright(`📂 File changed: ${filename}`));

  // Flag to stop the build process if a file changes during the build
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

  await nextTask('Building the custom elements manifest...', 'cem analyze');

  if (isStopped) {
    return;
  }

  await nextTask(
    'Building storybook...',
    'npx storybook build -o dist-storybook'
  );

  // Restart storybook server
  // Somehow even after a build, the dev server doesn't pick up the changes.
  // It needs a dev restart to pick them up.
  storybookServer.kill('SIGTERM');
  storybookServer = exec('npx storybook dev -p 4400 --no-open', {
    stdio: 'ignore',
  });

  if (isStopped) {
    return;
  }

  console.log(chalk.magenta.bold(' 🎇 Build process completed! 🎇 '));
});
