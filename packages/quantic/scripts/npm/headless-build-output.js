const {createHash} = require('node:crypto');
const {
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} = require('node:fs');
const path = require('node:path');

const headlessQuanticManifestSchemaVersion = 1;

const expectedHeadlessBundlePaths = Object.freeze([
  'headless.js',
  'case-assist/headless.js',
  'insight/headless.js',
  'recommendation/headless.js',
]);

const expectedHeadlessDefinitionPaths = Object.freeze([
  'index.d.ts',
  'case-assist.index.d.ts',
  'insight.index.d.ts',
  'recommendation.index.d.ts',
]);

function isDirectory(filePath) {
  try {
    return statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function isFile(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function assertCompleteOutput(root, expectedPaths, outputName) {
  if (!isDirectory(root)) {
    throw new Error(
      `Headless ${outputName} output directory is missing: ${root}`
    );
  }

  const missingPaths = expectedPaths.filter(
    (relativePath) => !isFile(path.join(root, relativePath))
  );
  if (missingPaths.length) {
    throw new Error(
      `Headless ${outputName} output is incomplete at ${root}. Missing: ${missingPaths.join(', ')}`
    );
  }

  return root;
}

function compareNames({name: first}, {name: second}) {
  return first < second ? -1 : first > second ? 1 : 0;
}

function manifestError(manifestPath, message) {
  return new Error(
    `Invalid Headless Quantic output manifest at ${manifestPath}: ${message}`
  );
}

function readPathStat(filePath, pathName, manifestPath) {
  try {
    return lstatSync(filePath);
  } catch {
    throw manifestError(manifestPath, `${pathName} is missing: ${filePath}`);
  }
}

function assertDedicatedDirectory(directoryPath, directoryName, manifestPath) {
  const directoryStat = readPathStat(
    directoryPath,
    directoryName,
    manifestPath
  );
  if (directoryStat.isSymbolicLink()) {
    throw manifestError(
      manifestPath,
      `${directoryName} cannot be a symbolic link`
    );
  }
  if (!directoryStat.isDirectory()) {
    throw manifestError(manifestPath, `${directoryName} must be a directory`);
  }
}

function assertDedicatedFile(filePath, fileName, manifestPath) {
  const fileStat = readPathStat(filePath, fileName, manifestPath);
  if (fileStat.isSymbolicLink()) {
    throw manifestError(manifestPath, `${fileName} cannot be a symbolic link`);
  }
  if (!fileStat.isFile()) {
    throw manifestError(manifestPath, `${fileName} must be a regular file`);
  }
}

function listFiles(root, outputName, manifestPath) {
  const files = [];
  function visit(directory, prefix) {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort(
      compareNames
    )) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = path.join(directory, entry.name);
      const entryStat = readPathStat(
        absolutePath,
        `${outputName} path`,
        manifestPath
      );

      if (entryStat.isSymbolicLink()) {
        throw manifestError(
          manifestPath,
          `${outputName} cannot contain symbolic links: ${relativePath}`
        );
      } else if (entryStat.isDirectory()) {
        visit(absolutePath, relativePath);
      } else if (entryStat.isFile()) {
        files.push(relativePath);
      } else {
        throw manifestError(
          manifestPath,
          `${outputName} contains an unsupported path: ${relativePath}`
        );
      }
    }
  }

  visit(root, '');
  return files;
}

function assertExactKeys(value, expectedKeys, valueName, manifestPath) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw manifestError(manifestPath, `${valueName} must be an object`);
  }

  const keys = Object.keys(value).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...expectedKeys].sort())) {
    throw manifestError(
      manifestPath,
      `${valueName} must contain exactly: ${expectedKeys.join(', ')}`
    );
  }
}

function assertInsideRoot(root, candidate, manifestPath, filePath) {
  const relativePath = path.relative(root, candidate);
  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw manifestError(
      manifestPath,
      `file path escapes the dedicated root: ${filePath}`
    );
  }
}

function assertExactPaths(actual, expected, outputName, manifestPath) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
    throw manifestError(
      manifestPath,
      `${outputName} must be exactly: ${sortedExpected.join(', ')}`
    );
  }
}

function readManifest(manifestPath) {
  let manifestContents;
  try {
    manifestContents = readFileSync(manifestPath, 'utf8');
  } catch {
    throw manifestError(manifestPath, 'manifest file is missing or unreadable');
  }

  let manifest;
  try {
    manifest = JSON.parse(manifestContents);
  } catch {
    throw manifestError(manifestPath, 'manifest must be valid JSON');
  }

  assertExactKeys(
    manifest,
    ['schemaVersion', 'files'],
    'manifest',
    manifestPath
  );
  if (manifest.schemaVersion !== headlessQuanticManifestSchemaVersion) {
    throw manifestError(
      manifestPath,
      `schemaVersion must be ${headlessQuanticManifestSchemaVersion}`
    );
  }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw manifestError(manifestPath, 'files must be a non-empty array');
  }

  const filePaths = [];
  for (const [index, file] of manifest.files.entries()) {
    assertExactKeys(
      file,
      ['path', 'size', 'sha256'],
      `files[${index}]`,
      manifestPath
    );
    if (
      typeof file.path !== 'string' ||
      file.path === '' ||
      file.path.includes('\\') ||
      path.posix.isAbsolute(file.path) ||
      file.path === '..' ||
      file.path.startsWith('../') ||
      path.posix.normalize(file.path) !== file.path
    ) {
      throw manifestError(
        manifestPath,
        `files[${index}].path must be a safe relative path`
      );
    }
    if (!Number.isSafeInteger(file.size) || file.size < 0) {
      throw manifestError(
        manifestPath,
        `files[${index}].size must be a non-negative integer`
      );
    }
    if (
      typeof file.sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/.test(file.sha256)
    ) {
      throw manifestError(
        manifestPath,
        `files[${index}].sha256 must be a SHA-256 digest`
      );
    }
    filePaths.push(file.path);
  }

  for (let index = 1; index < filePaths.length; index++) {
    if (filePaths[index - 1] >= filePaths[index]) {
      throw manifestError(manifestPath, 'files must be sorted by unique path');
    }
  }

  return manifest;
}

function validateDedicatedOutput(packageRoot) {
  const outputRoot = path.join(packageRoot, '.tmp/quantic');
  const bundleRoot = path.join(outputRoot, 'bundles');
  const definitionsRoot = path.join(outputRoot, 'definitions');
  const manifestPath = path.join(outputRoot, 'manifest.json');
  assertDedicatedDirectory(outputRoot, 'dedicated output root', manifestPath);
  assertDedicatedDirectory(bundleRoot, 'bundle root', manifestPath);
  assertDedicatedDirectory(definitionsRoot, 'definition root', manifestPath);
  assertDedicatedFile(manifestPath, 'manifest', manifestPath);
  const actualOutputPaths = listFiles(
    outputRoot,
    'dedicated output',
    manifestPath
  );
  const resolvedOutputRoot = path.resolve(outputRoot);
  const realOutputRoot = realpathSync(outputRoot);
  assertInsideRoot(
    realOutputRoot,
    realpathSync(bundleRoot),
    manifestPath,
    'bundles/'
  );
  assertInsideRoot(
    realOutputRoot,
    realpathSync(definitionsRoot),
    manifestPath,
    'definitions/'
  );
  assertInsideRoot(
    realOutputRoot,
    realpathSync(manifestPath),
    manifestPath,
    'manifest.json'
  );

  const manifest = readManifest(manifestPath);
  const expectedBundleManifestPaths = expectedHeadlessBundlePaths.map(
    (filePath) => `bundles/${filePath}`
  );
  const expectedDefinitionManifestPaths = expectedHeadlessDefinitionPaths.map(
    (filePath) => `definitions/${filePath}`
  );
  const bundleManifestPaths = manifest.files
    .map(({path: filePath}) => filePath)
    .filter((filePath) => filePath.startsWith('bundles/'));
  const definitionManifestPaths = manifest.files
    .map(({path: filePath}) => filePath)
    .filter((filePath) => filePath.startsWith('definitions/'));

  if (
    bundleManifestPaths.length + definitionManifestPaths.length !==
    manifest.files.length
  ) {
    throw manifestError(
      manifestPath,
      'files must be under bundles/ or definitions/'
    );
  }
  assertExactPaths(
    bundleManifestPaths,
    expectedBundleManifestPaths,
    'runtime bundle paths',
    manifestPath
  );
  if (
    definitionManifestPaths.length === 0 ||
    definitionManifestPaths.some((filePath) => !filePath.endsWith('.d.ts'))
  ) {
    throw manifestError(
      manifestPath,
      'definitions must contain only .d.ts files'
    );
  }
  for (const entryPath of expectedDefinitionManifestPaths) {
    if (!definitionManifestPaths.includes(entryPath)) {
      throw manifestError(
        manifestPath,
        `missing definition entrypoint: ${entryPath}`
      );
    }
  }

  for (const file of manifest.files) {
    const absolutePath = path.resolve(outputRoot, ...file.path.split('/'));
    assertInsideRoot(resolvedOutputRoot, absolutePath, manifestPath, file.path);

    let fileStat;
    try {
      fileStat = lstatSync(absolutePath);
    } catch {
      throw manifestError(
        manifestPath,
        `manifested file is missing: ${file.path}`
      );
    }
    if (fileStat.isSymbolicLink()) {
      throw manifestError(
        manifestPath,
        `manifested file cannot be a symbolic link: ${file.path}`
      );
    }
    if (!fileStat.isFile()) {
      throw manifestError(
        manifestPath,
        `manifested path is not a regular file: ${file.path}`
      );
    }
    assertInsideRoot(
      realOutputRoot,
      realpathSync(absolutePath),
      manifestPath,
      file.path
    );

    const contents = readFileSync(absolutePath);
    if (contents.byteLength !== file.size) {
      throw manifestError(manifestPath, `size mismatch for ${file.path}`);
    }
    const digest = createHash('sha256').update(contents).digest('hex');
    if (digest !== file.sha256) {
      throw manifestError(manifestPath, `SHA-256 mismatch for ${file.path}`);
    }
  }

  const actualBundlePaths = actualOutputPaths
    .filter((filePath) => filePath.startsWith('bundles/'))
    .map((filePath) => filePath.slice('bundles/'.length));
  assertExactPaths(
    actualBundlePaths,
    expectedHeadlessBundlePaths,
    'runtime bundle tree',
    manifestPath
  );
  assertExactPaths(
    actualOutputPaths.filter((filePath) => filePath.startsWith('definitions/')),
    definitionManifestPaths,
    'definition paths',
    manifestPath
  );
  assertExactPaths(
    actualOutputPaths,
    [...manifest.files.map(({path: filePath}) => filePath), 'manifest.json'],
    'dedicated output paths',
    manifestPath
  );

  return {bundleRoot, definitionsRoot};
}

function resolveHeadlessPackageRoot() {
  return path.dirname(require.resolve('@coveo/headless/package.json'));
}

function resolveHeadlessBundlesPath({
  packageRoot = resolveHeadlessPackageRoot(),
  turboHash = process.env.TURBO_HASH,
} = {}) {
  if (turboHash) {
    return validateDedicatedOutput(packageRoot).bundleRoot;
  }

  return assertCompleteOutput(
    path.join(packageRoot, 'dist/quantic'),
    expectedHeadlessBundlePaths,
    'bundle'
  );
}

function resolveHeadlessDefinitionsPath({
  packageRoot = resolveHeadlessPackageRoot(),
  turboHash = process.env.TURBO_HASH,
} = {}) {
  if (turboHash) {
    return validateDedicatedOutput(packageRoot).definitionsRoot;
  }

  return assertCompleteOutput(
    path.join(packageRoot, 'dist/definitions'),
    expectedHeadlessDefinitionPaths,
    'definition'
  );
}

module.exports = {
  expectedHeadlessBundlePaths,
  expectedHeadlessDefinitionPaths,
  headlessQuanticManifestSchemaVersion,
  resolveHeadlessBundlesPath,
  resolveHeadlessDefinitionsPath,
};
