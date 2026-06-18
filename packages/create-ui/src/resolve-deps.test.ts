import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  parseCatalogs,
  resolveDependencyMap,
  resolvePackageJson,
  resolveSampleDependencies,
  type ResolutionContext,
} from './resolve-deps.js';

const ctx: ResolutionContext = {
  catalog: {vite: '8.0.14', react: '19.2.7'},
  catalogs: {react18: {react: '18.3.1'}},
  workspaceVersions: {
    '@coveo/headless': '3.40.0',
    '@coveo/auth': '2.1.9',
  },
};

describe('parseCatalogs', () => {
  it('parses the default catalog and named catalogs', () => {
    const yaml = [
      'catalog:',
      '  vite: 8.0.14',
      '  react: 19.2.7',
      'catalogs:',
      '  react18:',
      '    react: 18.3.1',
    ].join('\n');
    const {catalog, catalogs} = parseCatalogs(yaml);
    expect(catalog.vite).toBe('8.0.14');
    expect(catalogs.react18.react).toBe('18.3.1');
  });

  it('returns empty objects when no catalog is present', () => {
    expect(parseCatalogs('packages:\n  - a\n')).toEqual({
      catalog: {},
      catalogs: {},
    });
  });
});

describe('resolveDependencyMap', () => {
  it('resolves catalog: to a caret range from the default catalog', () => {
    expect(resolveDependencyMap({vite: 'catalog:'}, ctx)).toEqual({
      vite: '^8.0.14',
    });
  });

  it('resolves catalog:<name> from a named catalog', () => {
    expect(resolveDependencyMap({react: 'catalog:react18'}, ctx)).toEqual({
      react: '^18.3.1',
    });
  });

  it('resolves workspace: protocols to a caret range from the package version', () => {
    expect(
      resolveDependencyMap(
        {'@coveo/headless': 'workspace:*', '@coveo/auth': 'workspace:^'},
        ctx
      )
    ).toEqual({'@coveo/headless': '^3.40.0', '@coveo/auth': '^2.1.9'});
  });

  it('leaves concrete versions untouched', () => {
    expect(resolveDependencyMap({express: '5.2.1'}, ctx)).toEqual({
      express: '5.2.1',
    });
  });

  it('throws when a catalog reference cannot be resolved', () => {
    expect(() => resolveDependencyMap({unknown: 'catalog:'}, ctx)).toThrow(
      /Cannot resolve "unknown"/
    );
  });

  it('throws when a workspace dependency has no known version', () => {
    expect(() =>
      resolveDependencyMap({'@coveo/missing': 'workspace:*'}, ctx)
    ).toThrow(/Cannot resolve "@coveo\/missing"/);
  });
});

describe('resolvePackageJson', () => {
  it('resolves across all dependency fields', () => {
    const resolved = resolvePackageJson(
      {
        name: 'x',
        dependencies: {'@coveo/headless': 'workspace:*', react: 'catalog:'},
        devDependencies: {vite: 'catalog:'},
      },
      ctx
    );
    expect(resolved.dependencies).toEqual({
      '@coveo/headless': '^3.40.0',
      react: '^19.2.7',
    });
    expect(resolved.devDependencies).toEqual({vite: '^8.0.14'});
  });
});

describe('resolveSampleDependencies (IO)', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'create-ui-resolve-'));
  });
  afterEach(async () => {
    await rm(dir, {recursive: true, force: true});
  });

  it('rewrites the sample package.json from the extracted tree', async () => {
    await writeFile(
      join(dir, 'pnpm-workspace.yaml'),
      'catalog:\n  vite: 8.0.14\n'
    );
    await mkdir(join(dir, 'packages/headless'), {recursive: true});
    await writeFile(
      join(dir, 'packages/headless/package.json'),
      JSON.stringify({name: '@coveo/headless', version: '3.40.0'})
    );
    const sampleDir = join(dir, 'samples/headless/search-react');
    await mkdir(sampleDir, {recursive: true});
    await writeFile(
      join(sampleDir, 'package.json'),
      JSON.stringify({
        name: '@samples/headless-search-react',
        dependencies: {'@coveo/headless': 'workspace:*'},
        devDependencies: {vite: 'catalog:'},
      })
    );

    await resolveSampleDependencies({sampleDir, treeRoot: dir});

    const pkg = JSON.parse(
      await readFile(join(sampleDir, 'package.json'), 'utf8')
    );
    expect(pkg.dependencies['@coveo/headless']).toBe('^3.40.0');
    expect(pkg.devDependencies.vite).toBe('^8.0.14');
  });
});
