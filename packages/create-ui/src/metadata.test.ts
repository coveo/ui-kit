import {describe, expect, it} from 'vitest';
import {
  buildProjectMetadata,
  extractCoveoDependencies,
  getCliVersion,
  type BuildProjectMetadataInput,
} from './metadata.js';

const baseInput: BuildProjectMetadataInput = {
  template: 'headless-search-react',
  templateVersion: '3.5.0',
  dependencies: {'@coveo/headless': '4.1.0', '@coveo/atomic': '4.1.0'},
};

const fixedOverrides = {
  now: new Date('2026-07-03T13:41:00.000Z'),
  cliVersion: '1.1.0',
  nodeVersion: 'v22.10.0',
  packageManager: 'pnpm',
};

describe('extractCoveoDependencies', () => {
  it('keeps only @coveo/* packages and preserves their declared order', () => {
    const result = extractCoveoDependencies({
      dependencies: {
        react: '18.0.0',
        '@coveo/headless': '4.1.0',
        lodash: '4.17.0',
        '@coveo/atomic': '4.1.0',
        '@coveo/atomic-react': '4.1.0',
      },
    });
    expect(Object.keys(result)).toEqual([
      '@coveo/headless',
      '@coveo/atomic',
      '@coveo/atomic-react',
    ]);
    expect(result['@coveo/headless']).toBe('4.1.0');
  });

  it('returns an empty object when there are no dependencies', () => {
    expect(extractCoveoDependencies({})).toEqual({});
    expect(extractCoveoDependencies({dependencies: {react: '18.0.0'}})).toEqual({});
  });
});

describe('buildProjectMetadata', () => {
  it('assembles every field in the documented shape', () => {
    const metadata = buildProjectMetadata(baseInput, fixedOverrides);
    expect(metadata).toEqual({
      template: 'headless-search-react',
      templateVersion: '3.5.0',
      createdWith: 'create-ui@1.1.0',
      createdOn: '2026-07-03T13:41:00.000Z',
      dependencies: {'@coveo/headless': '4.1.0', '@coveo/atomic': '4.1.0'},
      node: '22.10.0',
      packageManager: 'pnpm',
    });
  });

  it('formats createdWith as create-ui@<version>', () => {
    const metadata = buildProjectMetadata(baseInput, {
      ...fixedOverrides,
      cliVersion: '2.3.4',
    });
    expect(metadata.createdWith).toBe('create-ui@2.3.4');
  });

  it('strips the leading "v" from the node version', () => {
    const withV = buildProjectMetadata(baseInput, {
      ...fixedOverrides,
      nodeVersion: 'v24.11.0',
    });
    expect(withV.node).toBe('24.11.0');
    const withoutV = buildProjectMetadata(baseInput, {
      ...fixedOverrides,
      nodeVersion: '24.11.0',
    });
    expect(withoutV.node).toBe('24.11.0');
  });

  it('defaults createdOn to now and node to the running runtime', () => {
    const before = Date.now();
    const metadata = buildProjectMetadata(baseInput, {cliVersion: '1.0.0'});
    const created = Date.parse(metadata.createdOn);
    expect(created).toBeGreaterThanOrEqual(before);
    expect(created).toBeLessThanOrEqual(Date.now());
    expect(metadata.node).toBe(process.version.replace(/^v/, ''));
  });

  it('records only tool/version strings — no paths or extra keys (no PII)', () => {
    const metadata = buildProjectMetadata(baseInput, fixedOverrides);
    expect(Object.keys(metadata).sort()).toEqual([
      'createdOn',
      'createdWith',
      'dependencies',
      'node',
      'packageManager',
      'template',
      'templateVersion',
    ]);
    const scalarValues = Object.values(metadata).filter((value) => typeof value === 'string');
    for (const value of scalarValues) {
      expect(value).not.toMatch(/[/\\]/);
    }
  });
});

describe('getCliVersion', () => {
  it('reads a version string from the create-ui package.json', () => {
    expect(getCliVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
