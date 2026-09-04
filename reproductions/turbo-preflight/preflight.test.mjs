import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {rmSync} from 'node:fs';
import {dirname, join} from 'node:path';
import process from 'node:process';
import {after, before, test} from 'node:test';
import {fileURLToPath} from 'node:url';

import {startMockCache} from './mock-cache.mjs';

const expectedSlug = 'my-team';
const methods = ['PUT', 'GET', 'HEAD'];
const root = dirname(fileURLToPath(import.meta.url));
let cacheOrigin;
let operations;

const cleanFixture = () => {
  rmSync(join(root, '.turbo'), {force: true, recursive: true});
  rmSync(join(root, 'app', 'dist'), {force: true, recursive: true});
};

const commandForPlatform = (command) => (process.platform === 'win32' ? `${command}.cmd` : command);

const run = (command, args, {capture = false, env = process.env, quiet = false} = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio: capture
        ? ['ignore', 'pipe', 'inherit']
        : quiet
          ? ['ignore', 'ignore', 'inherit']
          : 'inherit',
    });
    let stdout = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });

const operationFor = (method) => {
  const operation = operations.find((candidate) => candidate.method === method);
  assert.ok(operation, `Expected a signed ${method} request.`);
  return operation;
};

before(async () => {
  cleanFixture();
  const cache = await startMockCache();
  cacheOrigin = cache.origin;

  try {
    let exactVersion;
    let turbo;
    if (process.env.TURBO_BINARY) {
      exactVersion = await run(process.env.TURBO_BINARY, ['--version'], {capture: true});
      turbo = [process.env.TURBO_BINARY, []];
    } else {
      const requestedVersion = process.env.TURBO_VERSION ?? 'canary';
      const resolvedVersion = await run(
        commandForPlatform('npm'),
        ['view', `turbo@${requestedVersion}`, 'version'],
        {capture: true}
      );
      exactVersion = resolvedVersion.split('\n').at(-1);
      turbo = [commandForPlatform('npx'), ['--yes', `turbo@${exactVersion}`]];
    }
    const turboEnv = {
      ...process.env,
      CI: '1',
      DO_NOT_TRACK: '1',
      TURBO_TELEMETRY_DISABLED: '1',
      TURBO_TOKEN: 'test-token',
    };
    const runTurbo = (args, options = {}) =>
      run(
        turbo[0],
        [...turbo[1], 'run', 'build', '--skip-infer', '--preflight', '--cache=remote:rw', ...args],
        {env: turboEnv, ...options}
      );

    console.log(`Testing turbo ${exactVersion} against ${cacheOrigin}`);
    await runTurbo(['--ui=stream'], {quiet: true});

    cleanFixture();
    await runTurbo(['--ui=stream'], {quiet: true});
    await runTurbo(['--dry=json'], {quiet: true});
  } finally {
    operations = cache.getOperations();
    await cache.close();
  }
});

after(cleanFixture);

test('includes team context in every artifact preflight', () => {
  const actual = methods.map((method) => {
    const {preflightUrl} = operationFor(method);
    return {
      method,
      slug: preflightUrl ? new URL(preflightUrl, cacheOrigin).searchParams.get('slug') : null,
    };
  });
  const expected = methods.map((method) => ({method, slug: expectedSlug}));

  assert.deepEqual(actual, expected);
});

test('advertises the actual method in every artifact preflight', () => {
  const actual = methods.map((method) => ({
    advertisedMethod: operationFor(method).requestedMethod,
    method,
  }));
  const expected = methods.map((method) => ({advertisedMethod: method, method}));

  assert.deepEqual(actual, expected);
});

test('uses every explicit Location without modification', () => {
  const actual = methods.map((method) => ({
    location: operationFor(method).actualLocation,
    method,
  }));
  const expected = methods.map((method) => ({
    location: operationFor(method).expectedLocation,
    method,
  }));

  assert.deepEqual(actual, expected);
});
