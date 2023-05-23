// eslint-disable-next-line node/no-unpublished-import
import type {ConfigRuntime} from '@verdaccio/types';
import getPort from 'get-port';
import {ChildProcess, fork} from 'node:child_process';
import {writeFileSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {dirSync} from 'tmp';

const require = createRequire(import.meta.url);

export async function startVerdaccio(): Promise<{
  verdaccioProcess: ChildProcess;
  verdaccioUrl: string;
  verdaccioScope: string;
}> {
  const port = await getPort();
  const configPath = computeVerdaccioConfig();
  const verdaccioProcess = await runVerdaccio(configPath, port);
  const verdaccioUrl = `http://localhost:${port}`;
  const verdaccioScope = `//localhost:${port}/`;

  return {verdaccioProcess, verdaccioUrl, verdaccioScope};
}

function runVerdaccio(
  configPath: string,
  verdaccioPort: number
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childFork = fork(
      require.resolve('verdaccio/bin/verdaccio'),
      ['--config', configPath, '--listen', verdaccioPort.toString()],
      {stdio: 'ignore'}
    );
    childFork.on('message', (msg: {verdaccio_started: boolean}) => {
      if (msg.verdaccio_started) {
        resolve(childFork);
      }
    });
    childFork.on('error', (err: unknown) => reject([err]));
    childFork.on('disconnect', (err: unknown) => reject([err]));
  });
}

function computeVerdaccioConfig() {
  const tmpDir = dirSync({unsafeCleanup: true});
  const storagePath = join(tmpDir.name, 'storage');
  mkdirSync(storagePath);
  const config: ConfigRuntime = {
    self_path: 'foo',
    security: {
      api: {legacy: true},
      web: {
        sign: {ignoreExpiration: true},
        verify: {ignoreExpiration: true},
      },
    },
    uplinks: {
      npmjs: {
        url: 'https://registry.npmjs.org/',
        cache: false,
      },
    },
    packages: {
      ['**']: {
        access: ['$all', '$anonymous'],
        publish: ['$all', '$anonymous'],
        proxy: ['npmjs'],
      },
    },
    storage: storagePath,
    max_body_size: '150mb',
  };
  const tmpFile = join(tmpDir.name, 'config.json');
  writeFileSync(tmpFile, JSON.stringify(config));
  return tmpFile;
}
