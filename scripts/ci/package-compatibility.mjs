/* eslint-disable @cspell/spellchecker */
import {exec} from 'child_process';
import {publint} from 'publint';
import {promisify} from 'util';

const pkgDirs = [
  'packages/atomic',
  'packages/headless',
  'packages/atomic-react',
];

// For available attw.ignoreRules values, see https://www.npmjs.com/package/@arethetypeswrong/cli#ignore-rules
// Available publint.level values: 'error' | 'suggestion' | 'warning'
const pkgs = [
  {
    pkgDir: 'packages/atomic',
    attw: {
      enabled: false,
      ignoreRules: [],
    },
    publint: {
      enable: true,
      level: 'error',
    },
  },
  {
    pkgDir: 'packages/atomic-react',
    attw: {
      enabled: false,
      ignoreRules: [],
    },
    publint: {
      enable: true,
      level: 'error',
    },
  },
  {
    pkgDir: 'packages/headless',
    attw: {
      enabled: true,
      ignoreRules: [],
    },
    publint: {
      enabled: true,
      level: 'error',
    },
  },
];

const execute = promisify(exec);

let exitCode = 0;

const issues = {attw: [], publint: []};

for (const pkg of pkgs) {
  if (pkg.attw.enabled) {
    try {
      const ignoreRules =
        pkg.attw.ignoreRules.length > 0
          ? `--ignore-rules ${pkg.attwIgnoreRules.join(' ')}`
          : '';
      await execute(`attw --format ascii --pack ${pkg.pkgDir} ${ignoreRules}`);
    } catch (err) {
      issues.attw.push(err.stdout);
    }
  }

  if (pkg.publint.enabled) {
    const message = await publint({
      pkgDir: pkg.pkgDir,
      level: pkg.publint.level,
      strict: true,
    });

    if (message) {
      issues.publint.push({[pkg.pkgDir]: message});
    }
  }
}

console.info('***********************************');
console.info('*           ATTW REPORT           *');
console.info('***********************************\n');

if (issues.attw.length > 0) {
  console.error('attw found issues:\n', issues.attw.join('\n'));
  exitCode = 1;
} else {
  console.info('No issues found by attw.');
}

console.info('***********************************');
console.info('*         PUBLINT REPORT          *');
console.info('***********************************\n');

if (issues.publint.length > 0) {
  console.error(
    'publint found issues:\n',
    JSON.stringify(issues.publint, null, 2)
  );
  exitCode = 1;
} else {
  console.info('No issues found by publint.');
}

process.exit(exitCode);
