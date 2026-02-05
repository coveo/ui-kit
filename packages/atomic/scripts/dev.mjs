import {exec} from 'node:child_process';
import {watch} from 'node:fs';
import {createServer} from 'node:net';
import waitOn from 'wait-on';
import colors from '../../../utils/ci/colors.mjs';

/**
 * Tries to bind to a specific host and port.
 * @param {number} port - The port to check.
 * @param {string} host - The host to bind to.
 * @returns {Promise<boolean>} True if binding succeeded, false otherwise.
 */
function tryBind(port, host) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    server.listen(port, host);
  });
}

/**
 * Checks if a port is available by attempting to bind to it.
 * Checks multiple interfaces to ensure the port is truly free.
 * @param {number} port - The port to check.
 * @returns {Promise<boolean>} True if the port is available, false otherwise.
 */
async function isPortAvailable(port) {
  // Check all common bind addresses that servers might use
  const hostsToCheck = ['127.0.0.1', '0.0.0.0', '::'];

  for (const host of hostsToCheck) {
    const available = await tryBind(port, host);
    if (!available) {
      return false;
    }
  }

  return true;
}

/**
 * Finds an available port starting from the given port.
 * @param {number} startPort - The preferred port to start checking from.
 * @param {number} [maxAttempts=100] - Maximum number of ports to try.
 * @returns {Promise<number>} An available port.
 */
async function findAvailablePort(startPort, maxAttempts = 100) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(
    `Could not find an available port starting from ${startPort}`
  );
}

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
 * Default ports for development servers.
 * If these ports are busy, the next available port will be used.
 */
const DEFAULT_VITE_PORT = 3333;
const DEFAULT_STORYBOOK_PORT = 4400;

/**
 * Actual ports being used (may differ from defaults if ports were busy).
 * @type {{vite: number, storybook: number}}
 */
let activePorts = {vite: DEFAULT_VITE_PORT, storybook: DEFAULT_STORYBOOK_PORT};

function createSpinner(text) {
  const frames = ['⚽  🐕  ', ' ⚽ 🐕  ', '  ⚽🐕  ', ' ⚽🐕   ', '⚽ 🐕   '];
  let currentFrame = 0;
  let intervalId = null;
  let isRunning = false;

  return {
    start() {
      if (isRunning) return this;

      isRunning = true;
      intervalId = setInterval(() => {
        process.stdout.write(`\r${frames[currentFrame]} ${text}`);
        currentFrame = (currentFrame + 1) % frames.length;
      }, 200);

      return this;
    },

    succeed(finalText) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      isRunning = false;
      process.stdout.write(`\r✅ ${finalText || text}\n`);
    },

    fail(finalText) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      isRunning = false;
      process.stdout.write(`\r❌ ${finalText || text}\n`);
    },
  };
}

/**
 * Executes a command as a child process with a spinner animation.
 *
 * @param {string} text - The text to display alongside the spinner.
 * @param {string} command - The command to execute in the child process.
 * @returns {Promise<void>} A promise that resolves when the command completes successfully, or rejects if an error occurs.
 */
async function nextTask(text, command) {
  const spinner = createSpinner(text).start();

  return new Promise((resolve, reject) => {
    const childProcess = exec(command, {stdio: 'inherit'});

    // Add the process to the list of running processes to be able to stop them
    runningProcesses.push(childProcess);

    childProcess.on('exit', (code) => {
      runningProcesses = runningProcesses.filter((p) => p !== childProcess);

      if (code === 0) {
        spinner.succeed(colors.magenta.bold(`${text}`));
        resolve();
      } else {
        spinner.fail(colors.red.bold(`${text}`));
      }
    });

    childProcess.on('error', (error) => {
      spinner.fail(colors.red.bold(`${text}`));
      reject(error);
    });
  });
}

async function stopAllProcesses() {
  isStopped = true;

  runningProcesses.forEach((process) => {
    if (process?.kill) {
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
  } catch (_) {
    throw new Error(`Timeout waiting for port ${port} on ${host}`);
  }
}

async function startServers() {
  console.log(colors.green.bold('🚀 Starting development servers...'));

  // Find available ports (allows running multiple worktrees simultaneously)
  activePorts.storybook = await findAvailablePort(DEFAULT_STORYBOOK_PORT);
  activePorts.vite = await findAvailablePort(DEFAULT_VITE_PORT);

  if (activePorts.storybook !== DEFAULT_STORYBOOK_PORT) {
    console.log(
      colors.yellow(
        `⚠️  Port ${DEFAULT_STORYBOOK_PORT} is busy, using port ${activePorts.storybook} for Storybook`
      )
    );
  }
  if (activePorts.vite !== DEFAULT_VITE_PORT) {
    console.log(
      colors.yellow(
        `⚠️  Port ${DEFAULT_VITE_PORT} is busy, using port ${activePorts.vite} for Vite`
      )
    );
  }

  storybookServer = exec(
    `npx storybook dev -p ${activePorts.storybook} --no-open`,
    {
      stdio: 'ignore',
    }
  );

  exec(`npx vite serve dev --port ${activePorts.vite}`, {stdio: 'ignore'});

  // Run headless in dev as well
  exec('npx turbo run dev --filter=@coveo/headless', {
    stdio: 'ignore',
  });

  console.log(
    colors.yellow(
      `⌛ Waiting for Storybook (${activePorts.storybook}) and Vite (${activePorts.vite})...`
    )
  );
  await Promise.all([
    waitForPort(activePorts.storybook),
    waitForPort(activePorts.vite),
  ]);

  console.log(colors.blue.bold('✅ Servers started! Watching for changes...'));
  console.log(
    colors.cyan(`   Storybook: http://localhost:${activePorts.storybook}`)
  );
  console.log(colors.cyan(`   Vite:      http://localhost:${activePorts.vite}`));
}

// Get the stencil flag
const isStencil = process.argv.includes('--stencil');

// Start the servers (vite & storybook) first
await startServers();

// Watch the src folder for changes
watch('src', {recursive: true}, async (_, filename) => {
  // Ignore irrelevant files
  if (
    filename.endsWith('.mdx') ||
    filename.endsWith('.new.stories.tsx') ||
    filename.endsWith('.spec.ts') ||
    filename.includes('e2e') ||
    filename.endsWith('index.ts') ||
    filename.endsWith('lazy-index.ts') ||
    filename.endsWith('.DS_Store') ||
    filename.endsWith('custom-element-tags.ts')
  ) {
    return;
  }

  // Stop all processes if a file changes to prevent multiple builds at once
  await stopAllProcesses();
  console.log(colors.cyanBright(`📂 File changed: ${filename}`));

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
  storybookServer = exec(
    `npx storybook dev -p ${activePorts.storybook} --no-open`,
    {
      stdio: 'ignore',
    }
  );

  if (isStopped) {
    return;
  }

  console.log(colors.magenta.bold(' 🎇 Build process completed! 🎇 '));
});
