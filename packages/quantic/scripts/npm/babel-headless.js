const {execFileSync} = require('node:child_process');
const path = require('node:path');
const {resolveHeadlessBundlesPath} = require('./headless-build-output');

const source = resolveHeadlessBundlesPath();
const babelPackageRoot = path.dirname(
  require.resolve('@babel/cli/package.json')
);
const babelCli = path.join(babelPackageRoot, 'bin/babel.js');

execFileSync(
  process.execPath,
  [
    babelCli,
    source,
    '--delete-dir-on-start',
    '--out-dir',
    '.tmp/quantic-compiled',
    '--extensions',
    '.js',
    '--minified',
  ],
  {stdio: 'inherit'}
);
