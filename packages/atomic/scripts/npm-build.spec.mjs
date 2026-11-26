import {readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const esmDir = fileURLToPath(new URL('../dist/esm', import.meta.url));

describe('the npm ESM build', () => {
  it('should not import any JSON module', () => {
    const filesImportingJson = readdirSync(esmDir, {recursive: true}).filter(
      (file) =>
        file.endsWith('.js') &&
        /\b(?:from|import)\s*["'][^"']+\.json["']/.test(readFileSync(join(esmDir, file), 'utf8'))
    );

    expect(
      filesImportingJson,
      'webpack and Rspack only expose the default export of a JSON module imported from a "type": "module" package, and Node.js needs an import attribute. Set the value at build time instead, with a `define` in rslib.config.mjs.'
    ).toEqual([]);
  });

  it('should export the version of the Headless package it was built with', async () => {
    const {headlessVersion} = await import('../dist/esm/versions.js');
    const {version} = createRequire(import.meta.url)('@coveo/headless/package.json');

    expect(headlessVersion).toBe(version);
  });
});
