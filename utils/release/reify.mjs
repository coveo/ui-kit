#!/usr/bin/env node
import Arborist from '@npmcli/arborist';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const arb = new Arborist({
  savePrefix: '',
  path: rootFolder,
  registry: process.env.npm_config_registry,
  _authToken: 'invalid', // TODO: Remove when removing Lerna
});
await arb.loadVirtual();
await arb.buildIdealTree({
  update: {
    all: true,
  },
});
await arb.reify();
