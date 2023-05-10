#!/usr/bin/env node
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param {[K, V][]} entries
 * @returns {Record<K, V>}
 * @template {PropertyKey} K
 * @template V
 */
function fromEntries(entries) {
  /** @type {any} */
  const finalObj = {};
  for (const [key, value] of entries) {
    finalObj[key] = value;
  }
  return finalObj;
}

/**
 * @param {(config: Record<string, string>) => Record<string, string>} callback
 */
function modifyNpmRc(callback) {
  const npmRcLocation = resolve(rootFolder, '.npmrc');
  const npmRcContents = readFileSync(npmRcLocation).toString();
  const npmRcEntries = fromEntries(
    // @ts-ignore
    npmRcContents
      .split(/\n/g)
      .map((line) => line.split('='))
      .filter((entry) => entry.length === 2)
  );
  writeFileSync(
    npmRcLocation,
    Object.entries(callback(npmRcEntries))
      .map((entry) => `${entry.join('=')}\n`)
      .join('')
  );
}

const {verdaccioUrl, verdaccioScope, verdaccioProcess} = await startVerdaccio();
modifyNpmRc((config) => ({
  ...config,
  registry: verdaccioUrl,
  [`${verdaccioScope}:_authToken`]: 'invalid',
}));

console.info(
  `Started Verdaccio (PID: ${verdaccioProcess.pid}) at URL:`,
  verdaccioUrl
);
process.exit(0);
