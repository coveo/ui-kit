import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(packageRoot, '.tmp/quantic');
const bundleRoot = resolve(outputRoot, 'bundles');
const definitionsRoot = resolve(outputRoot, 'definitions');
const manifestPath = resolve(outputRoot, 'manifest.json');
const expectedBundlePaths = [
  'headless.js',
  'case-assist/headless.js',
  'insight/headless.js',
  'recommendation/headless.js',
];
const expectedDefinitionEntryPaths = [
  'index.d.ts',
  'case-assist.index.d.ts',
  'insight.index.d.ts',
  'recommendation.index.d.ts',
];

function compareNames({name: first}, {name: second}) {
  return first < second ? -1 : first > second ? 1 : 0;
}

function listFiles(root) {
  const files = [];

  function visit(directory, prefix) {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort(compareNames)) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(absolutePath, relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      } else {
        throw new Error(`Unsupported Headless Quantic output: ${absolutePath}`);
      }
    }
  }

  visit(root, '');
  return files;
}

function assertExactPaths(actual, expected, outputName) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
    throw new Error(
      `Unexpected Headless Quantic ${outputName}. Expected ${sortedExpected.join(', ')}; received ${sortedActual.join(', ')}`
    );
  }
}

const bundlePaths = listFiles(bundleRoot);
assertExactPaths(bundlePaths, expectedBundlePaths, 'runtime bundles');

const definitionPaths = listFiles(definitionsRoot);
const unexpectedDefinitionPaths = definitionPaths.filter((filePath) => !filePath.endsWith('.d.ts'));
if (unexpectedDefinitionPaths.length) {
  throw new Error(
    `Unexpected Headless Quantic definition outputs: ${unexpectedDefinitionPaths.join(', ')}`
  );
}
for (const entryPath of expectedDefinitionEntryPaths) {
  if (!definitionPaths.includes(entryPath)) {
    throw new Error(`Missing Headless Quantic definition entrypoint: ${entryPath}`);
  }
}

const manifestedPaths = [
  ...bundlePaths.map((filePath) => `bundles/${filePath}`),
  ...definitionPaths.map((filePath) => `definitions/${filePath}`),
].sort();
const outputPaths = listFiles(outputRoot).filter((filePath) => filePath !== 'manifest.json');
assertExactPaths(outputPaths, manifestedPaths, 'manifested output files');

const files = manifestedPaths.map((filePath) => {
  const contents = readFileSync(resolve(outputRoot, ...filePath.split('/')));
  return {
    path: filePath,
    size: contents.byteLength,
    sha256: createHash('sha256').update(contents).digest('hex'),
  };
});

writeFileSync(manifestPath, `${JSON.stringify({schemaVersion: 1, files}, null, 2)}\n`);
