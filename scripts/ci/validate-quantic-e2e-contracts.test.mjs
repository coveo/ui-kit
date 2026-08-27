import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const headlessPackage = JSON.parse(read('packages/headless/package.json'));
const headlessTurbo = JSON.parse(read('packages/headless/turbo.json'));
const quanticPackage = JSON.parse(read('packages/quantic/package.json'));
const quanticTurbo = JSON.parse(read('packages/quantic/turbo.json'));
const ciWorkflow = parse(read('.github/workflows/ci.yml'));
const e2eWorkflow = parse(read('.github/workflows/e2e-quantic.yml'));
const e2eSetupAction = parse(read('.github/actions/e2e-quantic-setup/action.yml'));
const playwrightConfig = read('packages/quantic/playwright.config.ts');
const playwrightAction = parse(read('.github/actions/playwright-quantic/action.yml'));
const turboBinary = resolve(repositoryRoot, 'node_modules/.bin/turbo');
const require = createRequire(import.meta.url);
const {
  expectedHeadlessBundlePaths,
  expectedHeadlessDefinitionPaths,
  headlessQuanticManifestSchemaVersion,
  resolveHeadlessBundlesPath,
  resolveHeadlessDefinitionsPath,
} = require(resolve(repositoryRoot, 'packages/quantic/scripts/npm/headless-build-output.js'));
const affectednessContractPaths = [
  'packages/headless/.gitignore',
  'packages/headless/esbuild.mjs',
  'packages/headless/package.json',
  'packages/headless/scripts/write-quantic-manifest.mjs',
  'packages/headless/turbo.json',
  'packages/quantic/build-static-resources.js',
  'packages/quantic/package.json',
  'packages/quantic/scripts/npm/babel-headless.js',
  'packages/quantic/scripts/npm/headless-build-output.js',
  'packages/quantic/turbo.json',
  'scripts/ci/validate-quantic-e2e-contracts.test.mjs',
];

const playwrightOutputs = ['playwright-report/**', 'blob-report/**', 'test-results/**'];

const expectedRootInputs = [
  '$TURBO_ROOT$/.github/actions/apex-unit-tests/**',
  '$TURBO_ROOT$/.github/actions/calculate-affected/**',
  '$TURBO_ROOT$/.github/actions/e2e-quantic-setup/**',
  '$TURBO_ROOT$/.github/actions/merge-playwright-reports/**',
  '$TURBO_ROOT$/.github/actions/playwright-quantic/**',
  '$TURBO_ROOT$/.github/actions/post-scratch-org-links-on-pr/**',
  '$TURBO_ROOT$/.github/actions/setup-sfdx/**',
  '$TURBO_ROOT$/.github/actions/setup/**',
  '$TURBO_ROOT$/.github/workflows/ci.yml',
  '$TURBO_ROOT$/.github/workflows/e2e-quantic.yml',
];

test('defines separate Quantic E2E task contracts', () => {
  assert.equal(quanticPackage.scripts.e2e, 'playwright test');
  assert.equal(quanticPackage.scripts['e2e:playwright'], 'playwright test');
  assert.equal(quanticPackage.scripts['e2e:prepare'], undefined);

  assert.deepEqual(quanticTurbo.tasks.e2e.dependsOn, ['e2e:prepare']);
  assert.deepEqual(quanticTurbo.tasks.e2e.outputs, playwrightOutputs);
  assert.equal(quanticTurbo.tasks.e2e.cache, false);
  assert.deepEqual(quanticTurbo.tasks['e2e:prepare'].dependsOn, [
    'build:staticresources',
    'validate:e2e-task-contracts',
  ]);
  assert.deepEqual(quanticTurbo.tasks['e2e:prepare'].outputs, []);
  assert.deepEqual(quanticTurbo.tasks['e2e:playwright'].dependsOn, [
    '@coveo/platform-mock-api#build',
  ]);
  assert.deepEqual(quanticTurbo.tasks['e2e:playwright'].inputs, ['$TURBO_DEFAULT$']);
  assert.deepEqual(quanticTurbo.tasks['e2e:playwright'].outputs, playwrightOutputs);
  assert.equal(quanticTurbo.tasks['e2e:playwright'].cache, false);
});

test('builds the Headless output consumed by Quantic through a dedicated task', () => {
  assert.equal(
    headlessPackage.scripts['build:quantic'],
    'node ../../utils/ci/rm-rf.mjs .tmp/quantic && tsc -p src/tsconfig.build.json -d --emitDeclarationOnly --declarationDir .tmp/quantic/definitions && node esbuild.mjs quantic && node scripts/write-quantic-manifest.mjs'
  );
  assert.deepEqual(headlessTurbo.tasks['build:quantic'].dependsOn, [
    '@coveo/bueno#build',
    '@coveo/relay#build',
    'coveo.analytics#build',
  ]);
  assert.deepEqual(headlessTurbo.tasks['build:quantic'].outputs, ['.tmp/quantic/**']);
  assert.ok(
    headlessTurbo.tasks['build:quantic'].inputs.includes('scripts/write-quantic-manifest.mjs')
  );
  assert.equal(quanticPackage.scripts['babel:headless'], 'node scripts/npm/babel-headless.js');
  assert.ok(quanticPackage.files.includes('scripts/npm'));
  assert.deepEqual(quanticTurbo.tasks['babel:headless'].dependsOn, [
    '@coveo/headless#build:quantic',
  ]);
  assert.deepEqual(quanticTurbo.tasks['build:staticresources'].dependsOn, [
    '@coveo/bueno#build',
    'babel:headless',
    'coveo.analytics#build',
  ]);
  assert.deepEqual(quanticTurbo.tasks['validate:e2e-task-contracts'].dependsOn, [
    '@coveo/headless#build:quantic',
  ]);
});

test('selects Quantic E2E for workflow and action changes', () => {
  assert.deepEqual(
    quanticTurbo.tasks.e2e.inputs.toSorted(),
    ['$TURBO_DEFAULT$', ...expectedRootInputs].toSorted()
  );
});

test('routes each Quantic E2E stage through its task contract', () => {
  const setupCommands = e2eWorkflow.jobs['e2e-quantic-setup'].steps
    .filter((step) => step.run)
    .map((step) => step.run);
  const playwrightCommands = playwrightAction.runs.steps
    .filter((step) => step.run)
    .map((step) => step.run);

  assert.deepEqual(setupCommands, ['pnpm exec turbo run @coveo/quantic#e2e:prepare']);
  assert.deepEqual(playwrightCommands, [
    'pnpm exec turbo run @coveo/quantic#e2e:playwright -- --shard=${INPUTS_SHARDINDEX}/${INPUTS_SHARDTOTAL}',
  ]);

  const ciJob = ciWorkflow.jobs['e2e-quantic'];
  const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();
  const expectedCondition = `\${{
    always() &&
    !cancelled() &&
    needs.affected.result == 'success' &&
    (needs.build.result == 'success' || needs.build.result == 'skipped') &&
    contains(fromJSON(needs.affected.outputs.tasks), '@coveo/quantic#e2e') &&
    !(github.event_name == 'pull_request' && contains(github.event.pull_request.labels.*.name, 'skip-quantic'))
  }}`;

  assert.deepEqual(ciJob.needs, ['affected', 'build']);
  assert.equal(normalizeWhitespace(ciJob.if), normalizeWhitespace(expectedCondition));
  assert.equal(ciJob.uses, './.github/workflows/e2e-quantic.yml');
});

test('preserves Quantic E2E artifact handoffs', () => {
  const setupUpload = e2eSetupAction.runs.steps.find((step) =>
    step.uses?.startsWith('actions/upload-artifact@')
  );
  const playwrightDownload = playwrightAction.runs.steps.find((step) =>
    step.uses?.startsWith('actions/download-artifact@')
  );
  const playwrightUpload = playwrightAction.runs.steps.find((step) =>
    step.uses?.startsWith('actions/upload-artifact@')
  );
  const mergeReports = e2eWorkflow.jobs['merge-quantic-playwright-reports'].steps.find(
    (step) => step.uses === './.github/actions/merge-playwright-reports'
  );

  assert.deepEqual(setupUpload?.with, {
    name: 'quantic-playwright-env-lws-${{ inputs.lws-status }}',
    path: 'packages/quantic/.env',
    'include-hidden-files': true,
    'retention-days': 1,
    'if-no-files-found': 'error',
  });
  assert.deepEqual(playwrightDownload?.with, {
    pattern: 'quantic-playwright-env-*',
    path: 'packages/quantic/.env',
    'merge-multiple': true,
  });
  assert.deepEqual(playwrightUpload?.with, {
    name: 'quantic-blob-report-${{ matrix.shardIndex }}',
    path: 'packages/quantic/blob-report',
    'retention-days': 5,
  });
  assert.deepEqual(mergeReports?.with, {
    'working-directory': 'packages/quantic',
    'artifact-pattern': 'quantic-blob-report-*',
    'upload-artifact-name': 'quantic-playwright-report',
  });
});

test('preserves the Quantic E2E topology', () => {
  const jobs = e2eWorkflow.jobs;

  assert.deepEqual(jobs['e2e-quantic-setup'].strategy.matrix['lws-status'], [
    'enabled',
    'disabled',
  ]);
  assert.deepEqual(jobs['e2e-quantic-playwright-test'].strategy.matrix.shardIndex, [1, 2, 3, 4]);
  assert.deepEqual(jobs['e2e-quantic-playwright-test'].strategy.matrix.shardTotal, [4]);
  assert.equal(jobs['apex-quantic-tests'].needs, 'e2e-quantic-setup');
  assert.equal(jobs['post-scratch-org-links-to-pr'].needs, 'e2e-quantic-setup');
  assert.equal(jobs['e2e-quantic-playwright-test'].needs, 'e2e-quantic-setup');
  assert.deepEqual(jobs['merge-quantic-playwright-reports'].needs, ['e2e-quantic-playwright-test']);
  assert.deepEqual(jobs['e2e-quantic-cleanup'].needs, [
    'e2e-quantic-playwright-test',
    'apex-quantic-tests',
  ]);

  assert.match(playwrightConfig, /name: 'LWS-enabled'/);
  assert.match(playwrightConfig, /name: 'LWS-disabled'/);
});

const gitIdentityEnvironment = {
  GIT_AUTHOR_EMAIL: 'quantic-e2e-contract@example.invalid',
  GIT_AUTHOR_NAME: 'Quantic E2E contract',
  GIT_COMMITTER_EMAIL: 'quantic-e2e-contract@example.invalid',
  GIT_COMMITTER_NAME: 'Quantic E2E contract',
};

const runGit = (cwd, arguments_, options = {}) =>
  execFileSync('git', arguments_, {
    cwd,
    encoding: 'utf8',
    ...options,
  });

const runTurbo = (arguments_, cwd = repositoryRoot) =>
  execFileSync(turboBinary, arguments_, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1',
      TURBO_TELEMETRY_DISABLED: '1',
      TURBO_UI: 'false',
    },
    maxBuffer: 100 * 1024 * 1024,
  });

const runPnpm = (arguments_, cwd) => {
  const environment = {...process.env};
  delete environment.TURBO_HASH;
  delete environment.TURBO_TASK_ID;
  return execFileSync('pnpm', arguments_, {
    cwd,
    encoding: 'utf8',
    env: environment,
    maxBuffer: 100 * 1024 * 1024,
  });
};

const linkDirectory = (source, destination) => {
  assert.ok(existsSync(source), `${source} must exist`);
  mkdirSync(dirname(destination), {recursive: true});
  symlinkSync(source, destination, 'dir');
};

const withIsolatedRepository = (callback) => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'quantic-e2e-repository-'));

  try {
    const checkout = join(temporaryDirectory, 'ui-kit');
    execFileSync(
      'git',
      ['clone', '--no-local', '--depth=1', '--no-checkout', repositoryRoot, checkout],
      {encoding: 'utf8'}
    );
    runGit(checkout, ['checkout', '--detach', 'HEAD']);

    for (const filePath of affectednessContractPaths) {
      const destination = resolve(checkout, filePath);
      mkdirSync(dirname(destination), {recursive: true});
      cpSync(resolve(repositoryRoot, filePath), destination);
    }

    runGit(checkout, ['add', '--', ...affectednessContractPaths]);
    const parent = runGit(checkout, ['rev-parse', 'HEAD']).trim();
    const tree = runGit(checkout, ['write-tree']).trim();
    const baseline = runGit(checkout, ['commit-tree', tree, '-p', parent], {
      env: {...process.env, ...gitIdentityEnvironment},
      input: 'current Quantic E2E contract\n',
    }).trim();
    runGit(checkout, ['update-ref', 'HEAD', baseline]);

    assert.equal(runGit(checkout, ['status', '--short']).trim(), '');
    assert.equal(existsSync(resolve(checkout, '.git/objects/info/alternates')), false);

    linkDirectory(resolve(repositoryRoot, 'node_modules'), resolve(checkout, 'node_modules'));
    linkDirectory(
      resolve(repositoryRoot, 'packages/headless/node_modules'),
      resolve(checkout, 'packages/headless/node_modules')
    );

    return callback({baseline, checkout});
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }
};

const createCommit = (checkout, base, updateIndex, message) => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'quantic-e2e-index-'));
  const environment = {
    ...process.env,
    ...gitIdentityEnvironment,
    GIT_INDEX_FILE: join(temporaryDirectory, 'index'),
  };

  try {
    runGit(checkout, ['read-tree', base], {env: environment});
    updateIndex(environment);
    const tree = runGit(checkout, ['write-tree'], {env: environment}).trim();
    return runGit(checkout, ['commit-tree', tree, '-p', base], {
      env: environment,
      input: `${message}\n`,
    }).trim();
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }
};

const createScenarioCommit = (checkout, base, filePath, scenario) =>
  createCommit(
    checkout,
    base,
    (environment) => {
      const stagedFile = runGit(checkout, ['ls-files', '--stage', '--', filePath], {
        env: environment,
      }).trim();
      assert.notEqual(stagedFile, '', `${filePath} must be tracked`);
      const [mode] = stagedFile.split(' ');
      const blob = runGit(checkout, ['hash-object', '-w', '--stdin'], {
        env: environment,
        input: `${readFileSync(resolve(checkout, filePath), 'utf8')}\n// ${scenario}\n`,
      }).trim();
      runGit(checkout, ['update-index', '--add', '--cacheinfo', mode, blob, filePath], {
        env: environment,
      });
    },
    scenario
  );

const getAffectedTasks = (base, head, checkout) => {
  const query = `
    query {
      affectedTasks(base: "${base}", head: "${head}") {
        items {
          fullName
          reason {
            __typename
            ... on TaskFileChanged { filePath }
            ... on TaskDependencyTaskChanged { taskName packageName }
            ... on TaskPackageDependencyChanged { packageName }
            ... on TaskGlobalFileChanged { filePath }
            ... on TaskGlobalDepsChanged { filePath }
          }
        }
      }
    }
  `;
  const result = JSON.parse(runTurbo(['query', '--no-update-notifier', query], checkout));
  return result.data.affectedTasks.items;
};

const getQuanticE2EDependents = (checkout) => {
  const dryRun = JSON.parse(runTurbo(['run', '@coveo/quantic#e2e', '--dry=json'], checkout));
  return new Map(dryRun.tasks.map(({taskId, dependents}) => [taskId, dependents]));
};

const reachesQuanticE2E = (affectedTasks, dependentsByTask) => {
  const affected = new Set(affectedTasks);
  const queue = [...affectedTasks];

  while (queue.length) {
    const task = queue.shift();
    for (const dependent of dependentsByTask.get(task) ?? []) {
      if (!affected.has(dependent)) {
        affected.add(dependent);
        queue.push(dependent);
      }
    }
  }

  return affected.has('@coveo/quantic#e2e');
};

const writeExpectedFiles = (root, expectedPaths) => {
  for (const relativePath of expectedPaths) {
    const filePath = resolve(root, relativePath);
    mkdirSync(dirname(filePath), {recursive: true});
    writeFileSync(filePath, relativePath);
  }
};

const listFiles = (root, prefix = '') =>
  readdirSync(resolve(root, prefix), {withFileTypes: true})
    .flatMap((entry) => {
      const relativePath = join(prefix, entry.name);
      return entry.isDirectory() ? listFiles(root, relativePath) : [relativePath];
    })
    .sort();

const assertDirectoriesEqual = (actualRoot, expectedRoot) => {
  const actualFiles = listFiles(actualRoot);
  const expectedFiles = listFiles(expectedRoot);
  assert.deepEqual(actualFiles, expectedFiles);
  for (const relativePath of expectedFiles) {
    assert.deepEqual(
      readFileSync(resolve(actualRoot, relativePath)),
      readFileSync(resolve(expectedRoot, relativePath)),
      relativePath
    );
  }
};

const writeManifest = (packageRoot, transform = (manifest) => manifest) => {
  const outputRoot = resolve(packageRoot, '.tmp/quantic');
  const definitionPaths = listFiles(resolve(outputRoot, 'definitions')).map(
    (filePath) => `definitions/${filePath.replaceAll('\\', '/')}`
  );
  const filePaths = [
    ...expectedHeadlessBundlePaths.map((filePath) => `bundles/${filePath}`),
    ...definitionPaths,
  ].sort();
  const files = filePaths.map((filePath) => {
    const contents = readFileSync(resolve(outputRoot, ...filePath.split('/')));
    return {
      path: filePath,
      size: contents.byteLength,
      sha256: createHash('sha256').update(contents).digest('hex'),
    };
  });
  const manifestPath = resolve(outputRoot, 'manifest.json');
  const manifest = transform({
    schemaVersion: headlessQuanticManifestSchemaVersion,
    files,
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return {manifest, manifestPath};
};

test('fails closed on missing or corrupt manifested declarations and falls back directly to dist', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'quantic-headless-output-'));

  try {
    const packageRoot = join(temporaryDirectory, 'headless');
    const directBundles = resolve(packageRoot, 'dist/quantic');
    const directDefinitions = resolve(packageRoot, 'dist/definitions');
    const taskBundles = resolve(packageRoot, '.tmp/quantic/bundles');
    const taskDefinitions = resolve(packageRoot, '.tmp/quantic/definitions');
    const transitiveDefinition = resolve(
      taskDefinitions,
      'controllers/result-list/headless-result-list.d.ts'
    );

    writeExpectedFiles(directBundles, expectedHeadlessBundlePaths);
    writeExpectedFiles(directDefinitions, expectedHeadlessDefinitionPaths);
    assert.equal(resolveHeadlessBundlesPath({packageRoot, turboHash: ''}), directBundles);
    assert.equal(resolveHeadlessDefinitionsPath({packageRoot, turboHash: ''}), directDefinitions);

    writeExpectedFiles(taskBundles, expectedHeadlessBundlePaths);
    writeExpectedFiles(taskDefinitions, expectedHeadlessDefinitionPaths);
    mkdirSync(dirname(transitiveDefinition), {recursive: true});
    writeFileSync(transitiveDefinition, 'transitive declaration');
    writeManifest(packageRoot);
    assert.equal(resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}), taskBundles);
    assert.equal(
      resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      taskDefinitions
    );

    const originalContents = readFileSync(transitiveDefinition);
    rmSync(transitiveDefinition);
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /manifested file is missing: definitions\/controllers\/result-list\/headless-result-list\.d\.ts/
    );
    assert.throws(
      () => resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      /manifested file is missing: definitions\/controllers\/result-list\/headless-result-list\.d\.ts/
    );

    const corruptContents = Buffer.from(originalContents);
    corruptContents[0] ^= 1;
    writeFileSync(transitiveDefinition, corruptContents);
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /SHA-256 mismatch for definitions\/controllers\/result-list\/headless-result-list\.d\.ts/
    );
    assert.throws(
      () => resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      /SHA-256 mismatch for definitions\/controllers\/result-list\/headless-result-list\.d\.ts/
    );
    assert.equal(resolveHeadlessBundlesPath({packageRoot, turboHash: ''}), directBundles);
    assert.equal(resolveHeadlessDefinitionsPath({packageRoot, turboHash: ''}), directDefinitions);
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }
});

test('rejects invalid or incomplete dedicated Headless manifests', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'quantic-headless-manifest-'));

  try {
    const packageRoot = join(temporaryDirectory, 'headless');
    const taskBundles = resolve(packageRoot, '.tmp/quantic/bundles');
    const taskDefinitions = resolve(packageRoot, '.tmp/quantic/definitions');
    writeExpectedFiles(taskBundles, expectedHeadlessBundlePaths);
    writeExpectedFiles(taskDefinitions, expectedHeadlessDefinitionPaths);
    const {manifest, manifestPath} = writeManifest(packageRoot);

    writeFileSync(
      manifestPath,
      JSON.stringify({...manifest, schemaVersion: headlessQuanticManifestSchemaVersion + 1})
    );
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /schemaVersion must be 1/
    );

    const escapedManifest = structuredClone(manifest);
    escapedManifest.files[0].path = '../outside.js';
    writeFileSync(manifestPath, JSON.stringify(escapedManifest));
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /path must be a safe relative path/
    );

    const incompleteBundleManifest = structuredClone(manifest);
    incompleteBundleManifest.files = incompleteBundleManifest.files.filter(
      ({path: filePath}) => filePath !== 'bundles/recommendation/headless.js'
    );
    writeFileSync(manifestPath, JSON.stringify(incompleteBundleManifest));
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /runtime bundle paths must be exactly/
    );

    writeFileSync(manifestPath, JSON.stringify(manifest));
    writeFileSync(resolve(taskBundles, 'headless.js.map'), 'extra bundle output');
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /runtime bundle tree must be exactly/
    );
    rmSync(resolve(taskBundles, 'headless.js.map'));

    writeFileSync(resolve(taskDefinitions, 'extra.d.ts'), 'extra declaration');
    assert.throws(
      () => resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      /definition paths must be exactly/
    );
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }
});

test('rejects symlinked dedicated Headless roots and files', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'quantic-headless-symlink-'));

  try {
    const packageRoot = join(temporaryDirectory, 'headless');
    const outputRoot = resolve(packageRoot, '.tmp/quantic');
    const taskBundles = resolve(outputRoot, 'bundles');
    const taskDefinitions = resolve(outputRoot, 'definitions');
    const transitiveDirectory = resolve(taskDefinitions, 'controllers/result-list');
    writeExpectedFiles(taskBundles, expectedHeadlessBundlePaths);
    writeExpectedFiles(taskDefinitions, expectedHeadlessDefinitionPaths);
    mkdirSync(transitiveDirectory, {recursive: true});
    writeFileSync(resolve(transitiveDirectory, 'headless-result-list.d.ts'), 'transitive');
    const {manifestPath} = writeManifest(packageRoot);

    const manifestTarget = resolve(temporaryDirectory, 'manifest-target.json');
    renameSync(manifestPath, manifestTarget);
    symlinkSync(manifestTarget, manifestPath, 'file');
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /manifest cannot be a symbolic link/
    );
    rmSync(manifestPath);
    renameSync(manifestTarget, manifestPath);

    const bundlesTarget = resolve(temporaryDirectory, 'bundles-target');
    renameSync(taskBundles, bundlesTarget);
    symlinkSync(bundlesTarget, taskBundles, 'dir');
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /bundle root cannot be a symbolic link/
    );
    rmSync(taskBundles);
    renameSync(bundlesTarget, taskBundles);

    const definitionsTarget = resolve(temporaryDirectory, 'definitions-target');
    renameSync(taskDefinitions, definitionsTarget);
    symlinkSync(definitionsTarget, taskDefinitions, 'dir');
    assert.throws(
      () => resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      /definition root cannot be a symbolic link/
    );
    rmSync(taskDefinitions);
    renameSync(definitionsTarget, taskDefinitions);

    const subtreeTarget = resolve(temporaryDirectory, 'result-list-target');
    renameSync(transitiveDirectory, subtreeTarget);
    symlinkSync(subtreeTarget, transitiveDirectory, 'dir');
    assert.throws(
      () => resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      /dedicated output cannot contain symbolic links: definitions\/controllers\/result-list/
    );
    rmSync(transitiveDirectory);
    renameSync(subtreeTarget, transitiveDirectory);

    const bundlePath = resolve(taskBundles, 'headless.js');
    const bundleTarget = resolve(temporaryDirectory, 'headless-target.js');
    renameSync(bundlePath, bundleTarget);
    symlinkSync(bundleTarget, bundlePath, 'file');
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /dedicated output cannot contain symbolic links: bundles\/headless\.js/
    );
    rmSync(bundlePath);
    renameSync(bundleTarget, bundlePath);

    const outputTarget = resolve(temporaryDirectory, 'quantic-target');
    renameSync(outputRoot, outputTarget);
    symlinkSync(outputTarget, outputRoot, 'dir');
    assert.throws(
      () => resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}),
      /dedicated output root cannot be a symbolic link/
    );
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }
});

test('builds only complete declared Headless output for Quantic', () => {
  withIsolatedRepository(({checkout}) => {
    const packageRoot = resolve(checkout, 'packages/headless');
    runPnpm(['run', 'build:quantic'], packageRoot);

    const bundleRoot = resolve(packageRoot, '.tmp/quantic/bundles');
    const definitionsRoot = resolve(packageRoot, '.tmp/quantic/definitions');
    const manifestPath = resolve(packageRoot, '.tmp/quantic/manifest.json');
    const manifestContents = readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContents);
    const runtimeBundles = listFiles(bundleRoot).sort();
    const manifestedBundlePaths = manifest.files
      .map(({path: filePath}) => filePath)
      .filter((filePath) => filePath.startsWith('bundles/'))
      .map((filePath) => filePath.slice('bundles/'.length));
    const manifestedDefinitionPaths = manifest.files
      .map(({path: filePath}) => filePath)
      .filter((filePath) => filePath.startsWith('definitions/'))
      .map((filePath) => filePath.slice('definitions/'.length));

    assert.deepEqual(runtimeBundles, [...expectedHeadlessBundlePaths].sort());
    assert.equal(manifest.schemaVersion, headlessQuanticManifestSchemaVersion);
    assert.deepEqual(manifestedBundlePaths.sort(), [...expectedHeadlessBundlePaths].sort());
    assert.deepEqual(
      manifestedDefinitionPaths.sort(),
      listFiles(definitionsRoot).map((filePath) => filePath.replaceAll('\\', '/'))
    );
    for (const definitionPath of expectedHeadlessDefinitionPaths) {
      assert.ok(existsSync(resolve(definitionsRoot, definitionPath)), definitionPath);
    }
    assert.equal(resolveHeadlessBundlesPath({packageRoot, turboHash: 'task-hash'}), bundleRoot);
    assert.equal(
      resolveHeadlessDefinitionsPath({packageRoot, turboHash: 'task-hash'}),
      definitionsRoot
    );
    execFileSync(process.execPath, ['scripts/write-quantic-manifest.mjs'], {cwd: packageRoot});
    assert.equal(readFileSync(manifestPath, 'utf8'), manifestContents);
    assert.equal(existsSync(resolve(packageRoot, 'cdn')), false);
    assert.equal(existsSync(resolve(packageRoot, 'dist')), false);

    runPnpm(['run', 'build:definitions'], packageRoot);
    assertDirectoriesEqual(definitionsRoot, resolve(packageRoot, 'dist/definitions'));
  });
});

test('selects Quantic E2E from Turbo affectedness of embedded Headless output', () => {
  const scenarios = [
    {
      name: 'PR #8176 commerce test-only change',
      path: 'packages/headless/src/controllers/commerce/instant-products/headless-instant-products.test.ts',
      expected: false,
    },
    {
      name: 'Headless ESM-only build change',
      path: 'packages/headless/scripts/build.mjs',
      expected: false,
    },
    {
      name: 'Headless commerce TypeDoc-only change',
      path: 'packages/headless/typedoc-configs/commerce.typedoc.json',
      expected: false,
    },
    {
      name: 'Headless source embedded in Quantic',
      path: 'packages/headless/src/index.ts',
      expected: true,
    },
    {
      name: 'Headless Quantic manifest generator',
      path: 'packages/headless/scripts/write-quantic-manifest.mjs',
      expected: true,
    },
    {
      name: 'production commerce source included in copied declarations',
      path: 'packages/headless/src/controllers/commerce/instant-products/headless-instant-products.ts',
      expected: true,
    },
    {
      name: 'transitive Bueno source',
      path: 'packages/bueno/src/index.ts',
      expected: true,
    },
    {
      name: 'transitive Relay source',
      path: 'packages/relay/src/relay.ts',
      expected: true,
    },
    {
      name: 'transitive analytics source',
      path: 'packages/coveo-analytics/src/coveoua/headless.ts',
      expected: true,
    },
  ];

  withIsolatedRepository(({baseline, checkout}) => {
    const dependentsByTask = getQuanticE2EDependents(checkout);
    for (const scenario of scenarios) {
      const commit = createScenarioCommit(checkout, baseline, scenario.path, scenario.name);
      const affected = getAffectedTasks(baseline, commit, checkout);
      const affectedTasks = affected.map(({fullName}) => fullName);
      assert.equal(
        reachesQuanticE2E(affectedTasks, dependentsByTask),
        scenario.expected,
        `${scenario.name}\nAffected E2E DAG tasks:\n${JSON.stringify(
          affected.filter(({fullName}) => dependentsByTask.has(fullName)),
          null,
          2
        )}`
      );
    }
  });
});
