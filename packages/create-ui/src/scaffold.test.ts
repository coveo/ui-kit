import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {downloadTemplateMock, installDependenciesMock} = vi.hoisted(() => ({
  downloadTemplateMock: vi.fn(),
  installDependenciesMock: vi.fn(),
}));

vi.mock('./download.js', () => ({downloadTemplate: downloadTemplateMock}));
vi.mock('./setup.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./setup.js')>();
  return {...actual, installDependencies: installDependenciesMock};
});
vi.mock('./log.js', () => ({
  log: {
    info: vi.fn(),
    step: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    note: vi.fn(),
  },
}));

import {scaffold} from './index.js';
import {getTemplate} from './templates.js';

describe('scaffold provenance integration', () => {
  let cwd: string;
  let originalCwd: string;

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'create-ui-scaffold-'));
    originalCwd = process.cwd();
    process.chdir(cwd);
    installDependenciesMock.mockReturnValue(true);
    downloadTemplateMock.mockImplementation(
      async ({destDir}: {destDir: string}) => {
        await writeFile(
          join(destDir, 'package.json'),
          JSON.stringify({
            name: '@coveo/ui-kit-sample-headless-search-react',
            version: '3.5.0',
            private: true,
            dependencies: {'@coveo/headless': '4.1.0', react: '18.0.0'},
          })
        );
        return destDir;
      }
    );
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(cwd, {recursive: true, force: true});
    vi.clearAllMocks();
  });

  it('writes .coveo/create-ui.json with all fields during scaffolding', async () => {
    const template = getTemplate('headless-search-react')!;

    await scaffold({template, projectName: 'my-app'});

    const provenance = JSON.parse(
      await readFile(join(cwd, 'my-app', '.coveo', 'create-ui.json'), 'utf8')
    );
    expect(provenance.template).toBe('headless-search-react');
    expect(provenance.templateVersion).toBe('3.5.0');
    expect(provenance.dependencies).toEqual({'@coveo/headless': '4.1.0'});
    expect(provenance.createdWith).toMatch(/^create-ui@/);
    expect(provenance.node).toBe(process.version.replace(/^v/, ''));
    expect(typeof provenance.packageManager).toBe('string');
    expect(Date.parse(provenance.createdOn)).not.toBeNaN();
  });
});
