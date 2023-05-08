#!/usr/bin/env node
import Arborist from '@npmcli/arborist';
import {sync as globSync} from 'glob';
import { existsSync, readFileSync } from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const packagesToUpdate = globSync(
  JSON.parse(readFileSync(resolve(rootFolder, 'package.json')).toString())
    .workspaces,
  {cwd: rootFolder}
)
  .filter((packagePath) => existsSync(resolve(packagePath, 'package.json')))
  .map(
    (packagePath) =>
      JSON.parse(readFileSync(resolve(packagePath, 'package.json')).toString())
        .name
  );

const arb = new Arborist({
  savePrefix: '',
  path: rootFolder,
  registry: process.env.npm_config_registry,
  _authToken: 'invalid', // TODO: Remove when removing Lerna
});
console.log('Loading virtual tree.');
await arb.loadVirtual();
console.log('Building ideal tree. The following packages will be updated:', packagesToUpdate);
await arb.buildIdealTree({
  update: {
    names: packagesToUpdate,
  },
});
console.log('Applying ideal tree.');
await arb.reify();
