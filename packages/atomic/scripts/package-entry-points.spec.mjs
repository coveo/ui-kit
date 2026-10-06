import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, matchesGlob} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {entryPointSource, listLitComponents} from './generate-lit-exports.mjs';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const isSideEffectful = (file) => manifest.sideEffects.some((glob) => matchesGlob(file, glob));

function registeredTags(directory) {
  return readdirSync(directory, {withFileTypes: true, recursive: true})
    .filter(
      (file) =>
        file.isFile() && file.name.endsWith('.ts') && !/\.(spec|stories|e2e)\.ts$/.test(file.name)
    )
    .flatMap((file) => [
      ...readFileSync(join(file.parentPath, file.name), 'utf8').matchAll(
        /@customElement\(\s*['"](atomic-[a-z0-9-]+)['"]/g
      ),
    ])
    .map((match) => match[1]);
}

describe('package entry points', () => {
  it('should map each per-component entry point to its generated re-export', () => {
    expect(manifest.exports['./components/*']).toEqual({
      types: './dist/types/entry-points/*.d.ts',
      import: './dist/esm/entry-points/*.js',
    });
  });

  it('should not declare the per-component entry points as side-effectful', () => {
    expect(isSideEffectful('./dist/esm/entry-points/atomic-facet.js')).toBe(false);
  });

  it('should keep the component modules side-effectful', () => {
    expect(isSideEffectful('./dist/esm/components/search/atomic-facet/atomic-facet.js')).toBe(true);
  });

  it('should generate an entry point for every registered element', () => {
    const generated = listLitComponents().map(({component}) => component);

    expect(generated.sort()).toEqual(registeredTags(join(packageRoot, 'src/components')).sort());
  });

  it('should point each entry point at an existing component module', () => {
    const missing = listLitComponents()
      .map(({dir, component}) => ({
        component,
        target: entryPointSource(dir, component).match(/from '\.\.\/(.+)\.js'/)[1],
      }))
      .filter(({target}) => !existsSync(join(packageRoot, 'src', `${target}.ts`)));

    expect(missing).toEqual([]);
  });
});
