#!/usr/bin/env node

/**
 * Verifies that a packed Coveo framework wrapper can be consumed by an application
 * built with a given major version of that framework.
 *
 * The check is: scaffold a throwaway application pinned to that major, install the
 * packed wrapper and its declared peers, reference a generated component's type from
 * real source, and build. A failure means the declared peer range claims a major it
 * cannot actually support.
 *
 * Only the floors of each range are worth checking here. The ceiling is the version
 * the monorepo itself builds against, and the in-repo samples already build against
 * it on every pull request.
 *
 * The application is scaffolded outside the pnpm workspace on purpose. The default
 * catalog holds a single version of each framework for the whole monorepo, and
 * `pnpm.overrides` pins it transitively, so an in-repo sample cannot vary it.
 *
 * Uses only Node builtins, plus `tar` to read the packed manifest.
 *
 * Usage:
 *   node scripts/verify-framework-compat.mjs <framework> <major> [options]
 *
 *   <framework>          angular or react.
 *   <major>              Framework major version to test, for example 16.
 *   --tarball <path>     Tarball to install. Built and packed from the workspace when
 *                        omitted.
 *   --legacy-peers       Install with --legacy-peer-deps, so the declared peer range
 *                        is not enforced. Needed only to test a major deliberately
 *                        outside the published range.
 *   --workdir <path>     Where to scaffold. Defaults to a temporary directory.
 *   --keep               Leave the scaffolded application in place on success.
 *
 * Examples:
 *   node scripts/verify-framework-compat.mjs angular 16
 *   node scripts/verify-framework-compat.mjs react 18
 *   node scripts/verify-framework-compat.mjs angular 22 --legacy-peers
 */

import {execFileSync} from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const WORKSPACE_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Per-framework knowledge: which package to pack, how to scaffold, how to build. */
const FRAMEWORKS = {
  angular: {
    packageName: '@coveo/atomic-angular',
    packDirectory: 'packages/atomic-angular/projects/atomic-angular',
    tarballPrefix: 'coveo-atomic-angular-',
    buildTask: '@coveo/atomic-angular#build',
    scaffold(workdir, major) {
      // Scaffolded with the CLI for this major rather than from a committed fixture:
      // angular.json builders differ across majors, so the matching CLI is the only
      // thing that reliably produces a valid configuration.
      run(
        'npx',
        [
          '-y',
          `@angular/cli@${major}`,
          'new',
          'consumer',
          '--skip-git',
          '--skip-install',
          '--skip-tests',
          '--defaults',
          '--style=css',
        ],
        workdir
      );
      return join(workdir, 'consumer');
    },
    useLibrary(application) {
      // A type reference, not a bare import, so a change to the generated surface
      // fails the build. Appended to main.ts to stay version-agnostic: Angular 16
      // bootstraps an NgModule while 17 and later default to standalone.
      appendFileSync(
        join(application, 'src', 'main.ts'),
        [
          '',
          "import {AtomicAngularModule, type AtomicFacet} from '@coveo/atomic-angular';",
          '',
          'console.log(AtomicAngularModule);',
          "const assertGeneratedInput: keyof AtomicFacet = 'field';",
          'console.log(assertGeneratedInput);',
          '',
        ].join('\n')
      );
    },
    build(application) {
      run('npx', ['ng', 'build'], application);
    },
  },

  react: {
    packageName: '@coveo/atomic-react',
    packDirectory: 'packages/atomic-react',
    tarballPrefix: 'coveo-atomic-react-',
    buildTask: '@coveo/atomic-react#build',
    scaffold(workdir, major) {
      // React needs no scaffolding tool: a Vite application is a manifest, a
      // tsconfig and an entry point. Writing them directly keeps the React version
      // pinned to the major under test, which a template generator would not.
      const application = join(workdir, 'consumer');
      mkdirSync(join(application, 'src'), {recursive: true});

      writeFileSync(
        join(application, 'package.json'),
        `${JSON.stringify(
          {
            name: 'consumer',
            private: true,
            type: 'module',
            scripts: {build: 'tsc --noEmit && vite build'},
            dependencies: {
              react: `^${major}`,
              'react-dom': `^${major}`,
            },
            devDependencies: {
              '@types/react': `^${major}`,
              '@types/react-dom': `^${major}`,
              '@vitejs/plugin-react': '^5',
              typescript: '^5',
              vite: '^7',
            },
          },
          null,
          2
        )}\n`
      );

      writeFileSync(
        join(application, 'tsconfig.json'),
        `${JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2022',
              lib: ['ES2022', 'DOM'],
              module: 'ESNext',
              moduleResolution: 'bundler',
              jsx: 'react-jsx',
              strict: true,
              skipLibCheck: true,
              noEmit: true,
            },
            include: ['src'],
          },
          null,
          2
        )}\n`
      );

      writeFileSync(
        join(application, 'vite.config.ts'),
        [
          "import react from '@vitejs/plugin-react';",
          '',
          'export default {',
          '  plugins: [react()],',
          '};',
          '',
        ].join('\n')
      );

      writeFileSync(
        join(application, 'index.html'),
        [
          '<!doctype html>',
          '<html lang="en">',
          '  <head><meta charset="utf-8" /><title>consumer</title></head>',
          '  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>',
          '</html>',
          '',
        ].join('\n')
      );

      return application;
    },
    useLibrary(application) {
      // Rendering a generated component in JSX with a typed prop, so both the
      // component's props and the React types are exercised.
      writeFileSync(
        join(application, 'src', 'main.tsx'),
        [
          "import {createRoot} from 'react-dom/client';",
          "import {AtomicFacet} from '@coveo/atomic-react';",
          '',
          'const field: string = "author";',
          '',
          'createRoot(document.getElementById("root")!).render(',
          '  <AtomicFacet field={field} label="Authors" />',
          ');',
          '',
        ].join('\n')
      );
    },
    build(application) {
      run('npm', ['run', 'build'], application);
    },
  },
};

function printUsage() {
  console.log(
    [
      'Verify that a packed Coveo framework wrapper can be consumed by a given framework major.',
      '',
      'Usage: node scripts/verify-framework-compat.mjs <framework> <major> [options]',
      '',
      `  <framework>        ${Object.keys(FRAMEWORKS).join(' or ')}.`,
      '  <major>            Framework major version to test, for example 16.',
      '  --tarball <path>   Tarball to install. Built and packed from the workspace when omitted.',
      '  --legacy-peers     Install with --legacy-peer-deps, so the peer range is not enforced.',
      '  --workdir <path>   Where to scaffold. Defaults to a temporary directory.',
      '  --keep             Leave the scaffolded application in place on success.',
      '',
      'Examples:',
      '  node scripts/verify-framework-compat.mjs angular 16',
      '  node scripts/verify-framework-compat.mjs react 18',
      '  node scripts/verify-framework-compat.mjs angular 22 --legacy-peers',
    ].join('\n')
  );
}

function fail(message) {
  console.error(`error: ${message}`);
  console.error('run with --help for usage');
  process.exit(1);
}

function run(command, args, cwd) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, {cwd, stdio: 'inherit'});
}

function parseArguments(argv) {
  const positional = [];
  const options = {legacyPeers: false, keep: false, tarball: null, workdir: null, help: false};

  for (let i = 0; i < argv.length; i++) {
    const argument = argv[i];
    switch (argument) {
      case '--legacy-peers':
        options.legacyPeers = true;
        break;
      case '--keep':
        options.keep = true;
        break;
      case '--tarball':
        options.tarball = argv[++i];
        break;
      case '--workdir':
        options.workdir = argv[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (argument.startsWith('-')) {
          fail(`unknown option: ${argument}`);
        }
        positional.push(argument);
    }
  }

  if (options.help) {
    return options;
  }

  const [framework, major] = positional;
  if (!Object.hasOwn(FRAMEWORKS, framework ?? '')) {
    fail(`framework must be one of: ${Object.keys(FRAMEWORKS).join(', ')}`);
  }
  if (!/^\d+$/.test(major ?? '')) {
    fail('a framework major version is required, for example: 16');
  }
  if (options.tarball && !existsSync(options.tarball)) {
    fail(`tarball not found: ${options.tarball}`);
  }

  return {
    ...options,
    framework,
    major,
    tarball: options.tarball ? resolve(options.tarball) : null,
  };
}

/** Builds and packs the wrapper from the workspace, returning the tarball path. */
function packFromWorkspace(config) {
  console.log(`\n=== building and packing ${config.packageName} ===`);
  run('pnpm', ['turbo', 'run', config.buildTask], WORKSPACE_ROOT);

  const destination = mkdtempSync(join(tmpdir(), 'coveo-pack-'));
  run(
    'pnpm',
    ['pack', '--pack-destination', destination],
    join(WORKSPACE_ROOT, config.packDirectory)
  );

  const tarball = readdirSync(destination).find(
    (entry) => entry.startsWith(config.tarballPrefix) && entry.endsWith('.tgz')
  );
  if (!tarball) {
    fail('pnpm pack produced no tarball');
  }
  return join(destination, tarball);
}

/**
 * Reads the packed manifest without extracting the whole tarball, so the peers the
 * wrapper actually declares can be installed explicitly.
 */
function readPackedManifest(tarball) {
  const json = execFileSync('tar', ['-xzOf', tarball, 'package/package.json'], {encoding: 'utf8'});
  return JSON.parse(json);
}

/**
 * Peers that must be installed alongside the tarball. Peers the scaffold already
 * pins are skipped, so the major under test is not silently upgraded. Optional peers
 * are skipped entirely.
 *
 * This matters most with --legacy-peer-deps, where npm installs no peers at all and
 * a missing peer would fail the build for the wrong reason.
 */
function peersToInstall(packedManifest, scaffoldedManifestPath) {
  const declared = packedManifest.peerDependencies ?? {};
  const meta = packedManifest.peerDependenciesMeta ?? {};
  const scaffolded = JSON.parse(readFileSync(scaffoldedManifestPath, 'utf8'));
  const alreadyPinned = new Set([
    ...Object.keys(scaffolded.dependencies ?? {}),
    ...Object.keys(scaffolded.devDependencies ?? {}),
  ]);

  return Object.entries(declared)
    .filter(([name]) => !meta[name]?.optional && !alreadyPinned.has(name))
    .map(([name, range]) => `${name}@${range}`);
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const {framework, major, legacyPeers, keep} = options;
  const config = FRAMEWORKS[framework];
  const tarball = options.tarball ?? packFromWorkspace(config);
  const workdir = options.workdir
    ? resolve(options.workdir)
    : mkdtempSync(join(tmpdir(), `${framework}-compat-`));
  mkdirSync(workdir, {recursive: true});

  console.log(`\n=== verifying ${framework} ${major} against ${config.packageName} ===`);
  console.log(`tarball : ${tarball}`);
  console.log(`workdir : ${workdir}`);
  console.log(`peers   : ${legacyPeers ? 'not enforced (--legacy-peer-deps)' : 'enforced'}`);

  const application = config.scaffold(workdir, major);
  run('npm', ['install'], application);

  const packed = readPackedManifest(tarball);
  const peers = peersToInstall(packed, join(application, 'package.json'));
  const legacyFlag = legacyPeers ? ['--legacy-peer-deps'] : [];

  if (peers.length) {
    console.log(`\ninstalling declared peers: ${peers.join(', ')}`);
    run('npm', ['install', ...legacyFlag, ...peers], application);
  }
  run('npm', ['install', ...legacyFlag, tarball], application);

  config.useLibrary(application);
  config.build(application);

  console.log(`\n✓ ${framework} ${major} builds against ${packed.name}@${packed.version}`);

  if (keep || options.workdir) {
    console.log(`  application left at ${application}`);
  } else {
    rmSync(workdir, {recursive: true, force: true});
  }
}

main();
