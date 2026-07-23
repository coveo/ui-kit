import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  installDependencies,
  moveToTarget,
  rewritePackageJson,
  stripMonorepoFields,
  toPackageName,
} from './setup.js';

const {spawnSyncMock} = vi.hoisted(() => ({spawnSyncMock: vi.fn()}));
vi.mock('node:child_process', () => ({spawnSync: spawnSyncMock}));

describe('toPackageName', () => {
  it('lowercases and uses the final path segment', () => {
    expect(toPackageName('My-App')).toBe('my-app');
    expect(toPackageName('some/path/My App')).toBe('my-app');
  });
});

describe('stripMonorepoFields', () => {
  it('renames the package and strips the private flag', () => {
    const result = stripMonorepoFields(
      {name: '@samples/headless-search-react', private: true, foo: 'bar'},
      'my-app'
    );
    expect(result.name).toBe('my-app');
    expect(result.private).toBeUndefined();
    expect(result.version).toBe('0.1.0');
    expect(result.foo).toBe('bar');
  });

  it('strips the repository so scaffolded projects do not inherit the monorepo repo', () => {
    const result = stripMonorepoFields(
      {
        name: '@coveo/ui-kit-sample-headless-search-react',
        repository: {
          type: 'git',
          url: 'git+https://github.com/coveo/ui-kit.git',
          directory: 'samples/headless/search-react',
        },
        foo: 'bar',
      },
      'my-app'
    );
    expect(result.repository).toBeUndefined();
    expect(result.foo).toBe('bar');
  });
});

describe('rewritePackageJson', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'create-ui-setup-'));
  });
  afterEach(async () => {
    await rm(dir, {recursive: true, force: true});
  });

  it('rewrites the package.json in place with the project name', async () => {
    await writeFile(
      join(dir, 'package.json'),
      JSON.stringify({name: '@coveo/sample-x', private: true})
    );
    await rewritePackageJson(dir, 'my-app');

    const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('my-app');
    expect(pkg.private).toBeUndefined();
    expect(pkg.version).toBe('0.1.0');
  });
});

describe('moveToTarget', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'create-ui-setup-'));
  });
  afterEach(async () => {
    await rm(dir, {recursive: true, force: true});
  });

  async function exists(p: string): Promise<boolean> {
    try {
      await access(p);
      return true;
    } catch {
      return false;
    }
  }

  it('copies the source into the target and removes the source', async () => {
    const sourceDir = join(dir, 'extracted');
    await mkdir(sourceDir, {recursive: true});
    await writeFile(join(sourceDir, 'package.json'), '{}');
    const targetDir = join(dir, 'my-app');

    await moveToTarget(sourceDir, targetDir);

    expect(await exists(sourceDir)).toBe(false);
    expect(await exists(join(targetDir, 'package.json'))).toBe(true);
  });
});

describe('installDependencies', () => {
  const originalPlatform = process.platform;
  const originalUserAgent = process.env.npm_config_user_agent;

  function setPlatform(platform: NodeJS.Platform): void {
    Object.defineProperty(process, 'platform', {
      value: platform,
      configurable: true,
    });
  }

  afterEach(() => {
    setPlatform(originalPlatform);
    if (originalUserAgent === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalUserAgent;
    }
    spawnSyncMock.mockReset();
  });

  it('spawns the bare package-manager command through a shell on Windows', () => {
    setPlatform('win32');
    delete process.env.npm_config_user_agent;
    spawnSyncMock.mockReturnValue({status: 0});

    expect(installDependencies('/target dir')).toBe(true);

    const [command, args, options] = spawnSyncMock.mock.calls[0];
    // Bare name (not "npm.ps1"): cmd.exe resolves the .cmd/.exe shim via PATHEXT.
    expect(command).toBe('npm');
    expect(args).toEqual(['install']);
    expect(options).toMatchObject({cwd: '/target dir', shell: true});
  });

  it('runs the binary directly without a shell on POSIX', () => {
    setPlatform('linux');
    process.env.npm_config_user_agent = 'pnpm/9.0.0 node/v20.0.0';
    spawnSyncMock.mockReturnValue({status: 0});

    installDependencies('/target');

    const [command, , options] = spawnSyncMock.mock.calls[0];
    expect(command).toBe('pnpm');
    expect(options).toMatchObject({shell: false});
  });

  it('returns false when the package manager exits non-zero', () => {
    setPlatform('linux');
    spawnSyncMock.mockReturnValue({status: 1});
    expect(installDependencies('/target')).toBe(false);
  });
});
