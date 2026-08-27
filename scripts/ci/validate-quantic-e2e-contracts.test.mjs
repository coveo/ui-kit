import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  chmodSync,
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
import {delimiter, dirname, join, resolve} from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

import {
  analyzeTaskGraph,
  approvedTurboVersion,
  assertApprovedTurboVersion,
  escapeMarkdownValue,
  markdownTable,
  normalizeTurboTaskKey,
  pnpmLockfileValidationArguments,
} from '../../.github/actions/calculate-affected/affected-utils.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const headlessPackage = JSON.parse(read('packages/headless/package.json'));
const headlessTurbo = JSON.parse(read('packages/headless/turbo.json'));
const quanticPackage = JSON.parse(read('packages/quantic/package.json'));
const quanticTurbo = JSON.parse(read('packages/quantic/turbo.json'));
const ciWorkflow = parse(read('.github/workflows/ci.yml'));
const calculateAffectedAction = parse(read('.github/actions/calculate-affected/action.yml'));
const e2eWorkflow = parse(read('.github/workflows/e2e-quantic.yml'));
const e2eSetupAction = parse(read('.github/actions/e2e-quantic-setup/action.yml'));
const playwrightConfig = read('packages/quantic/playwright.config.ts');
const playwrightAction = parse(read('.github/actions/playwright-quantic/action.yml'));
const rootPackage = JSON.parse(read('package.json'));
const rootTurbo = JSON.parse(read('turbo.json'));
const turboBinary = resolve(repositoryRoot, 'node_modules/.bin/turbo');
const pnpmBinary = execFileSync(process.platform === 'win32' ? 'where' : 'which', ['pnpm'], {
  encoding: 'utf8',
})
  .trim()
  .split(/\r?\n/u)[0];
const require = createRequire(import.meta.url);
const {
  expectedHeadlessBundlePaths,
  expectedHeadlessDefinitionPaths,
  headlessQuanticManifestSchemaVersion,
  resolveHeadlessBundlesPath,
  resolveHeadlessDefinitionsPath,
} = require(resolve(repositoryRoot, 'packages/quantic/scripts/npm/headless-build-output.js'));
const affectednessContractPaths = [
  '.github/actions/calculate-affected/action.yml',
  '.github/actions/calculate-affected/affected.mjs',
  '.github/actions/calculate-affected/affected-utils.mjs',
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
  'turbo.json',
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

test('delegates lockfile affectedness to Turbo package resolution', () => {
  assert.equal(rootTurbo.globalDependencies.includes('pnpm-lock.yaml'), false);
});

test('installs pinned pnpm before the single affected-output step', () => {
  assert.equal(rootPackage.packageManager, 'pnpm@11.22.0');
  assert.equal(approvedTurboVersion, '2.10.9');
  assert.equal(rootPackage.devDependencies.turbo, approvedTurboVersion);
  assert.match(read('mise.toml'), /^pnpm = "11\.22\.0"$/m);
  assert.match(calculateAffectedAction.runs.steps[0].uses, /^step-security\/mise-action@/);
  assert.equal(calculateAffectedAction.runs.steps[0].with.install, true);
  assert.equal(calculateAffectedAction.runs.steps.length, 2);
  assert.equal(
    calculateAffectedAction.outputs['fetch-depth'].value,
    '${{ steps.calculate.outputs.fetch-depth }}'
  );
});

test('accepts only the approved Turbo specifier and repository task-key grammar', () => {
  assert.doesNotThrow(() => assertApprovedTurboVersion('2.10.9'));
  for (const specifier of [
    'npm:turbo@2.10.9',
    '^2.10.9',
    'https://registry.npmjs.org/turbo/-/turbo-2.10.9.tgz',
    'file:../turbo',
    'workspace:*',
    'v2.10.9',
    '2.10.9 ',
  ]) {
    assert.throws(() => assertApprovedTurboVersion(specifier), /repository-approved Turbo version/);
  }

  for (const [taskKey, expected] of [
    ['build', 'build'],
    ['functional-test', 'functional-test'],
    ['a11y:update-openacr', 'a11y:update-openacr'],
    ['//#lint:check:all', 'lint:check:all'],
  ]) {
    assert.equal(normalizeTurboTaskKey(taskKey), expected);
  }
  for (const taskKey of ['--help', '-build', '//#--help', 'build=--cache', 'build:-cache']) {
    assert.throws(() => normalizeTurboTaskKey(taskKey), /CLI-option syntax|task-name grammar/);
  }
  assert.throws(() => normalizeTurboTaskKey('build\n--help'), /control characters/);
  for (const taskKey of ['', 'build::test', 'build_test', 'Build']) {
    assert.throws(() => normalizeTurboTaskKey(taskKey), /non-empty strings|task-name grammar/);
  }
});

test('analyzes the validated Turbo task graph once with bounded traversals', () => {
  const graph = [
    {
      package: '@coveo/headless',
      task: 'build:quantic',
      taskId: '@coveo/headless#build:quantic',
      dependents: ['@coveo/quantic#babel:headless'],
    },
    {
      package: '@coveo/quantic',
      task: 'babel:headless',
      taskId: '@coveo/quantic#babel:headless',
      dependents: ['@coveo/quantic#e2e'],
    },
    {
      package: '@coveo/quantic',
      task: 'e2e',
      taskId: '@coveo/quantic#e2e',
      dependents: [],
    },
  ];

  assert.deepEqual(analyzeTaskGraph(graph, ['@coveo/headless#build:quantic']), {
    affectedTaskNames: [
      '@coveo/headless#build:quantic',
      '@coveo/quantic#babel:headless',
      '@coveo/quantic#e2e',
    ],
    selected: true,
    triggerTaskNames: ['@coveo/headless#build:quantic'],
  });
  assert.throws(
    () =>
      analyzeTaskGraph(
        graph.map((task, index) =>
          index === 0 ? {...task, dependents: ['@coveo/missing#build']} : task
        ),
        ['@coveo/headless#build:quantic']
      ),
    /dangling dependent/
  );
  assert.throws(
    () => analyzeTaskGraph(graph, ['@coveo/missing#build']),
    /Directly affected task is missing/
  );
  assert.throws(
    () => analyzeTaskGraph([...graph, graph[0]], ['@coveo/headless#build:quantic']),
    /duplicate task/
  );
  assert.throws(
    () => analyzeTaskGraph(graph.slice(0, 2), ['@coveo/headless#build:quantic']),
    /missing the selection target/
  );
  assert.throws(
    () => analyzeTaskGraph(graph, [], '@coveo/quantic#e2e', {tasks: 10, edges: 1}),
    /oversized task graph/
  );
  assert.throws(
    () => analyzeTaskGraph(graph, [], '@coveo/quantic#e2e', {tasks: 2, edges: 10}),
    /oversized task graph/
  );
});

test('escapes and bounds every dynamic Markdown value', () => {
  const malicious = `first\r\n# forged <script>& \`code\` \\ | [link](target) ${'*_!'.repeat(300)}`;
  const escaped = escapeMarkdownValue(malicious);
  assert.ok(escaped.length <= 512);
  assert.doesNotMatch(escaped, /[\r\n<>`\\|[\]()]/u);
  assert.match(escaped, /&#60;script&#62;/);
  assert.match(escaped, /&#8230;$/);

  const table = markdownTable(['value'], [[malicious]]);
  assert.doesNotMatch(table, /<script>|# forged|`code`|\[link\]/u);
  assert.ok(table.includes(escaped));
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
    maxBuffer: 100 * 1024 * 1024,
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

const runPnpm = (arguments_, cwd, environmentOverrides = {}) => {
  const environment = {...process.env};
  for (const name of Object.keys(environment)) {
    if (name.startsWith('GIT_') || name.startsWith('TURBO_')) {
      delete environment[name];
    }
  }
  Object.assign(environment, environmentOverrides);
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

const withIsolatedRepository = (callback, {linkNodeModules = true} = {}) => {
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

    if (linkNodeModules) {
      linkDirectory(resolve(repositoryRoot, 'node_modules'), resolve(checkout, 'node_modules'));
      linkDirectory(
        resolve(repositoryRoot, 'packages/headless/node_modules'),
        resolve(checkout, 'packages/headless/node_modules')
      );
    }

    return callback({baseline, checkout});
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
    assert.equal(existsSync(temporaryDirectory), false);
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
    assert.equal(existsSync(temporaryDirectory), false);
  }
};

const createScenarioCommit = (checkout, base, filePath, scenario) =>
  createFileContentsScenarioCommit(
    checkout,
    base,
    filePath,
    (contents) => `${contents}\n// ${scenario}\n`,
    scenario
  );

const createFileContentsScenarioCommit = (checkout, base, filePath, transformContents, scenario) =>
  createCommit(
    checkout,
    base,
    (environment) => {
      const stagedFile = runGit(checkout, ['ls-files', '--stage', '--', filePath], {
        env: environment,
      }).trim();
      assert.notEqual(stagedFile, '', `${filePath} must be tracked`);
      const [mode] = stagedFile.split(' ');
      const contents = readFileSync(resolve(checkout, filePath), 'utf8');
      const blob = runGit(checkout, ['hash-object', '-w', '--stdin'], {
        env: environment,
        input: transformContents(contents),
      }).trim();
      runGit(checkout, ['update-index', '--add', '--cacheinfo', mode, blob, filePath], {
        env: environment,
      });
    },
    scenario
  );

const replaceOnce = (contents, original, replacement) => {
  const firstMatch = contents.indexOf(original);
  assert.notEqual(firstMatch, -1, `Expected to find:\n${original}`);
  assert.equal(contents.indexOf(original, firstMatch + original.length), -1, `Expected one match`);
  return `${contents.slice(0, firstMatch)}${replacement}${contents.slice(
    firstMatch + original.length
  )}`;
};

const replaceImporterDependencyFields = (contents, importer, dependency, replacements) => {
  const importerMarker = `  ${importer}:\n`;
  const importerStart = contents.indexOf(importerMarker);
  assert.notEqual(importerStart, -1, `Missing lockfile importer: ${importer}`);
  const importerBodyStart = importerStart + importerMarker.length;
  const remainingContents = contents.slice(importerBodyStart);
  const nextImporterOffset = remainingContents.search(/\n  \S/);
  const importerEnd =
    nextImporterOffset === -1 ? contents.length : importerBodyStart + nextImporterOffset;
  const importerContents = contents.slice(importerStart, importerEnd);
  const dependencyMarkers = [
    `      ${dependency}:\n`,
    `      '${dependency}':\n`,
    `      "${dependency}":\n`,
  ];
  const matchingMarkers = dependencyMarkers.filter(
    (marker) => importerContents.indexOf(marker) !== -1
  );
  assert.equal(matchingMarkers.length, 1, `Missing or ambiguous ${dependency} in ${importer}`);
  const dependencyMarker = matchingMarkers[0];
  const dependencyStart = importerContents.indexOf(dependencyMarker);
  const dependencyBodyStart = dependencyStart + dependencyMarker.length;
  const nextDependencyOffset = importerContents.slice(dependencyBodyStart).search(/\n      \S/);
  const dependencyEnd =
    nextDependencyOffset === -1
      ? importerContents.length
      : dependencyBodyStart + nextDependencyOffset;
  const dependencyContents = importerContents.slice(dependencyStart, dependencyEnd);
  let updatedDependency = dependencyContents;
  for (const [field, {from, to}] of Object.entries(replacements)) {
    updatedDependency = replaceOnce(
      updatedDependency,
      `        ${field}: ${from}`,
      `        ${field}: ${to}`
    );
  }
  const updatedImporter = `${importerContents.slice(0, dependencyStart)}${updatedDependency}${importerContents.slice(dependencyEnd)}`;
  return `${contents.slice(0, importerStart)}${updatedImporter}${contents.slice(importerEnd)}`;
};

const replaceImporterVersion = (contents, importer, dependency, from, to) =>
  replaceImporterDependencyFields(contents, importer, dependency, {
    version: {from, to},
  });

const fixtureManifestPaths = [
  'packages/atomic/package.json',
  'packages/quantic/package.json',
  'packages/thermidor/package.json',
];

const updateDependencyRange = (checkout, manifestPath, dependency, range) => {
  const path = resolve(checkout, manifestPath);
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  const dependencyGroup = ['dependencies', 'devDependencies', 'optionalDependencies'].find(
    (group) => manifest[group]?.[dependency]
  );
  assert.ok(dependencyGroup, `${manifestPath} must declare ${dependency}`);
  manifest[dependencyGroup][dependency] = range;
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
};

const validateFrozenLockfile = (checkout) => {
  const lockfilePath = resolve(checkout, 'pnpm-lock.yaml');
  const before = readFileSync(lockfilePath);
  runPnpm(
    [...pnpmLockfileValidationArguments, '--offline', '--config.trust-lockfile=true'],
    checkout
  );
  assert.deepEqual(readFileSync(lockfilePath), before);
};

const createFrozenValidTurboSpecifierHead = (checkout, baseline, specifier, name) => {
  runGit(checkout, ['checkout', '--quiet', '--detach', baseline]);
  validateFrozenLockfile(checkout);
  const packagePath = resolve(checkout, 'package.json');
  const packageManifest = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageManifest.devDependencies.turbo = specifier;
  writeFileSync(packagePath, `${JSON.stringify(packageManifest, null, 2)}\n`);
  const lockfilePath = resolve(checkout, 'pnpm-lock.yaml');
  writeFileSync(
    lockfilePath,
    replaceImporterDependencyFields(readFileSync(lockfilePath, 'utf8'), '.', 'turbo', {
      specifier: {from: '2.10.9', to: specifier},
    })
  );
  validateFrozenLockfile(checkout);
  const head = commitWorkingTree(checkout, baseline, ['package.json', 'pnpm-lock.yaml'], name);
  assert.deepEqual(runGit(checkout, ['diff', '--name-only', baseline, head]).trim().split('\n'), [
    'package.json',
    'pnpm-lock.yaml',
  ]);
  runGit(checkout, ['checkout', '--quiet', '--detach', head]);
  validateFrozenLockfile(checkout);
  return head;
};

const createTurboTaskKeyHead = (checkout, baseline, taskKey, name) => {
  runGit(checkout, ['checkout', '--quiet', '--detach', baseline]);
  validateFrozenLockfile(checkout);
  const head = createFileContentsScenarioCommit(
    checkout,
    baseline,
    'turbo.json',
    (contents) => {
      const turboConfig = JSON.parse(contents);
      turboConfig.tasks[taskKey] = {cache: false};
      return `${JSON.stringify(turboConfig, null, 2)}\n`;
    },
    name
  );
  runGit(checkout, ['checkout', '--quiet', '--detach', head]);
  validateFrozenLockfile(checkout);
  return head;
};

const commitWorkingTree = (checkout, parent, paths, message) => {
  runGit(checkout, ['add', '--', ...paths]);
  const tree = runGit(checkout, ['write-tree']).trim();
  return runGit(checkout, ['commit-tree', tree, '-p', parent], {
    env: {...process.env, ...gitIdentityEnvironment},
    input: `${message}\n`,
  }).trim();
};

const assertOnlyLockfileChanged = (checkout, base, head) => {
  const changed = runGit(checkout, ['diff', '--name-only', base, head])
    .trim()
    .split('\n')
    .filter(Boolean);
  assert.deepEqual(changed, ['pnpm-lock.yaml']);
  for (const manifestPath of fixtureManifestPaths) {
    assert.equal(
      runGit(checkout, ['rev-parse', `${base}:${manifestPath}`]).trim(),
      runGit(checkout, ['rev-parse', `${head}:${manifestPath}`]).trim(),
      manifestPath
    );
  }
};

const prepareLockfileFixtureBaseline = (checkout, baseline) => {
  runGit(checkout, ['checkout', '--quiet', '--detach', baseline]);
  updateDependencyRange(checkout, 'packages/quantic/package.json', 'dompurify', '^3.4.0');
  updateDependencyRange(checkout, 'packages/quantic/package.json', 'wait-on', '>=8.0.5 <10');
  updateDependencyRange(checkout, 'packages/quantic/package.json', 'dotenv', '>=16.6.1 <18');
  updateDependencyRange(checkout, 'packages/atomic/package.json', 'prettier', '>=2.8.8 <4');
  updateDependencyRange(
    checkout,
    'packages/thermidor/package.json',
    '@ag-ui/core',
    '>=0.0.57 <=0.0.58'
  );
  const lockfilePath = resolve(checkout, 'pnpm-lock.yaml');
  const replacements = [
    ['packages/quantic', 'dompurify', {specifier: {from: "'catalog:'", to: '^3.4.0'}}],
    ['packages/quantic', 'wait-on', {specifier: {from: '9.1.0', to: "'>=8.0.5 <10'"}}],
    ['packages/quantic', 'dotenv', {specifier: {from: "'catalog:'", to: "'>=16.6.1 <18'"}}],
    ['packages/atomic', 'prettier', {specifier: {from: "'catalog:'", to: "'>=2.8.8 <4'"}}],
    [
      'packages/thermidor',
      '@ag-ui/core',
      {
        specifier: {from: '0.0.57', to: "'>=0.0.57 <=0.0.58'"},
        version: {from: '0.0.57', to: '0.0.58'},
      },
    ],
  ];
  const fixtureLockfile = replacements.reduce(
    (lockfile, [importer, dependency, fields]) =>
      replaceImporterDependencyFields(lockfile, importer, dependency, fields),
    readFileSync(lockfilePath, 'utf8')
  );
  writeFileSync(lockfilePath, fixtureLockfile);
  validateFrozenLockfile(checkout);
  const fixtureBaseline = commitWorkingTree(
    checkout,
    baseline,
    [...fixtureManifestPaths, 'pnpm-lock.yaml'],
    'frozen-valid lockfile fixture baseline'
  );
  runGit(checkout, ['checkout', '--quiet', '--detach', fixtureBaseline]);
  validateFrozenLockfile(checkout);
  assert.equal(runGit(checkout, ['status', '--short']).trim(), '');
  return fixtureBaseline;
};

const generateLockfileOnlyHead = (checkout, fixtureBaseline, scenario) => {
  runGit(checkout, ['checkout', '--quiet', '--detach', fixtureBaseline]);
  const lockfilePath = resolve(checkout, 'pnpm-lock.yaml');
  writeFileSync(
    lockfilePath,
    replaceImporterVersion(
      readFileSync(lockfilePath, 'utf8'),
      scenario.importer,
      scenario.dependency,
      scenario.baselineVersion,
      scenario.version
    )
  );
  validateFrozenLockfile(checkout);
  assert.equal(runGit(checkout, ['status', '--short']).trim(), 'M pnpm-lock.yaml');
  const head = commitWorkingTree(checkout, fixtureBaseline, ['pnpm-lock.yaml'], scenario.name);
  assertOnlyLockfileChanged(checkout, fixtureBaseline, head);
  return head;
};

const createCapturedWaitOnHead = (checkout, fixtureBaseline, scenario) => {
  runGit(checkout, ['checkout', '--quiet', '--detach', fixtureBaseline]);
  const head = createFileContentsScenarioCommit(
    checkout,
    fixtureBaseline,
    'pnpm-lock.yaml',
    (lockfile) => replaceImporterVersion(lockfile, 'packages/quantic', 'wait-on', '9.1.0', '8.0.5'),
    scenario.name
  );
  runGit(checkout, ['checkout', '--quiet', '--detach', head]);
  validateFrozenLockfile(checkout);
  assertOnlyLockfileChanged(checkout, fixtureBaseline, head);
  return head;
};

const createCapturedAtomicPrettierHead = (checkout, fixtureBaseline, scenario) => {
  runGit(checkout, ['checkout', '--quiet', '--detach', fixtureBaseline]);
  const head = createFileContentsScenarioCommit(
    checkout,
    fixtureBaseline,
    'pnpm-lock.yaml',
    (lockfile) => replaceImporterVersion(lockfile, 'packages/atomic', 'prettier', '3.9.6', '2.8.8'),
    scenario.name
  );
  runGit(checkout, ['checkout', '--quiet', '--detach', head]);
  validateFrozenLockfile(checkout);
  assertOnlyLockfileChanged(checkout, fixtureBaseline, head);
  return head;
};

const removeLastYamlBlock = (contents, key) => {
  const marker = `  ${key}:\n`;
  const start = contents.lastIndexOf(marker);
  assert.notEqual(start, -1, `Missing final YAML block ${key}`);
  const nextBlockOffset = contents.slice(start + marker.length).search(/\n  \S/u);
  const end =
    nextBlockOffset === -1 ? contents.length : start + marker.length + nextBlockOffset + 1;
  return `${contents.slice(0, start)}${contents.slice(end)}`;
};

const parseActionOutputs = (contents) =>
  Object.fromEntries(
    contents
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), JSON.parse(line.slice(separator + 1))];
      })
  );

const runAffectedCalculation = (checkout, base, head, environmentOverrides = {}) => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'quantic-affected-action-'));
  let result;

  try {
    const binDirectory = resolve(temporaryDirectory, 'bin');
    const invocationLogPath = resolve(temporaryDirectory, 'invocations.jsonl');
    const outputPath = resolve(temporaryDirectory, 'output');
    const summaryPath = resolve(temporaryDirectory, 'summary');
    const fakePnpmPath = resolve(binDirectory, 'pnpm');
    mkdirSync(binDirectory, {recursive: true});
    writeFileSync(invocationLogPath, '');
    writeFileSync(outputPath, '');
    writeFileSync(summaryPath, '');
    writeFileSync(
      fakePnpmPath,
      `#!/usr/bin/env node
const {spawnSync} = require('node:child_process');
const {appendFileSync} = require('node:fs');
const arguments_ = process.argv.slice(2);
appendFileSync(
  process.env.KIT_6131_INVOCATION_LOG,
  JSON.stringify({
    arguments: arguments_,
    environment: {
      GIT_DIR: process.env.GIT_DIR,
      GIT_INDEX_FILE: process.env.GIT_INDEX_FILE,
      TURBO_API: process.env.TURBO_API,
      TURBO_CACHE_DIR: process.env.TURBO_CACHE_DIR,
      TURBO_HASH: process.env.TURBO_HASH,
      TURBO_TEAM: process.env.TURBO_TEAM,
      TURBO_TOKEN: process.env.TURBO_TOKEN,
    },
  }) + '\\n'
);
let executable;
let delegatedArguments;
if (arguments_[0] === 'install') {
  executable = process.env.KIT_6131_PNPM_BINARY;
  delegatedArguments = [...arguments_, '--offline', '--config.trust-lockfile=true'];
} else {
  const [command, turboSpecifier, ...turboArguments] = arguments_;
  if (command !== 'dlx' || turboSpecifier !== 'turbo@${approvedTurboVersion}') {
    throw new Error('Unexpected pnpm invocation');
  }
  executable = process.env.KIT_6131_TURBO_BINARY;
  delegatedArguments = turboArguments;
}
const result = spawnSync(executable, delegatedArguments, {
  env: process.env,
  stdio: 'inherit',
});
if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
`
    );
    chmodSync(fakePnpmPath, 0o755);

    const environment = {
      ...process.env,
      GITHUB_OUTPUT: outputPath,
      GITHUB_REPOSITORY: 'coveo/ui-kit',
      GITHUB_RUN_ID: '6131',
      GITHUB_SERVER_URL: 'https://example.invalid',
      GITHUB_STEP_SUMMARY: summaryPath,
      GIT_DIR: '/untrusted/inherited/git-dir',
      GIT_INDEX_FILE: '/untrusted/inherited/git-index',
      KIT_6131_INVOCATION_LOG: invocationLogPath,
      KIT_6131_PNPM_BINARY: pnpmBinary,
      KIT_6131_TURBO_BINARY: turboBinary,
      NO_COLOR: '1',
      PATH: `${binDirectory}${delimiter}${process.env.PATH}`,
      TURBO_API: 'https://untrusted.invalid',
      TURBO_CACHE_DIR: '/untrusted/inherited/cache',
      TURBO_HASH: 'untrusted-hash',
      TURBO_SCM_BASE: base,
      TURBO_SCM_HEAD: head,
      TURBO_TEAM: 'untrusted-team',
      TURBO_TOKEN: 'untrusted-token',
      ...environmentOverrides,
    };

    const actionResult = spawnSync(
      process.execPath,
      [resolve(checkout, '.github/actions/calculate-affected/affected.mjs')],
      {
        cwd: checkout,
        encoding: 'utf8',
        env: environment,
        maxBuffer: 100 * 1024 * 1024,
      }
    );
    let error = actionResult.error;
    if (!error && actionResult.status !== 0) {
      error = Object.assign(new Error(`Affected calculation exited ${actionResult.status}`), {
        status: actionResult.status,
        stderr: actionResult.stderr,
        stdout: actionResult.stdout,
      });
    }

    result = {
      error,
      invocations: readFileSync(invocationLogPath, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line)),
      outputs: parseActionOutputs(readFileSync(outputPath, 'utf8')),
      summary: readFileSync(summaryPath, 'utf8'),
      temporaryDirectory,
    };
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
    assert.equal(existsSync(temporaryDirectory), false);
  }
  return result;
};

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

  for (let index = 0; index < queue.length; index += 1) {
    const task = queue[index];
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

const assertInvocationEnvironmentIsControlled = (invocations) => {
  for (const invocation of invocations) {
    assert.deepEqual(invocation.environment, {});
  }
};

const assertSuccessfulInvocationOrder = (invocations) => {
  assert.equal(invocations.length, 3);
  assert.deepEqual(invocations[0].arguments, [...pnpmLockfileValidationArguments]);
  assert.deepEqual(invocations[1].arguments.slice(0, 4), [
    'dlx',
    `turbo@${approvedTurboVersion}`,
    'query',
    '--no-update-notifier',
  ]);
  assert.deepEqual(invocations[2].arguments.slice(0, 5), [
    'dlx',
    `turbo@${approvedTurboVersion}`,
    'run',
    '--dry=json',
    '--cache=local:rw',
  ]);
  assertInvocationEnvironmentIsControlled(invocations);
};

const assertIncludesAndExcludes = (scenario, outputs) => {
  for (const outputName of ['tasks', 'projects', 'samples']) {
    const values = new Set(outputs[outputName]);
    for (const value of scenario.mustInclude[outputName]) {
      assert.ok(values.has(value), `${scenario.name} ${outputName} should include ${value}`);
    }
    for (const value of scenario.mustExclude[outputName]) {
      assert.ok(
        !values.has(value),
        `${scenario.name} ${outputName} should exclude ${value}; actual: ${JSON.stringify([...values])}`
      );
    }
  }
};

test('selects Quantic E2E only for frozen-valid lockfile-only CI dependency changes', () => {
  const quanticExpectations = {
    mustInclude: {
      tasks: [
        '@coveo/quantic#build',
        '@coveo/quantic#e2e',
        '@coveo/quantic#lint:check:all',
        '@coveo/quantic#promote:sfdx:ci',
        '@coveo/quantic#test',
      ],
      projects: ['@coveo/quantic'],
      samples: [],
    },
    mustExclude: {
      tasks: ['@coveo/thermidor#build', '@coveo/thermidor#publint', '@coveo/thermidor#test'],
      projects: ['@ag-ui/core'],
      samples: ['@samples/thermidor-search-react#e2e'],
    },
  };
  const scenarios = [
    {
      name: 'Quantic runtime dependency',
      filter: '@coveo/quantic',
      importer: 'packages/quantic',
      dependency: 'dompurify',
      baselineVersion: '3.4.13',
      version: '3.4.8',
      ...quanticExpectations,
    },
    {
      name: 'Quantic deployment dependency from PR #7982',
      capturedWaitOn: true,
      ...quanticExpectations,
    },
    {
      name: 'Quantic Playwright configuration dependency',
      filter: '@coveo/quantic',
      importer: 'packages/quantic',
      dependency: 'dotenv',
      baselineVersion: '17.2.3',
      version: '16.6.1',
      ...quanticExpectations,
    },
    {
      name: 'unrelated Atomic development dependency',
      filter: '@coveo/atomic',
      capturedAtomicPrettier: true,
      mustInclude: {
        tasks: [
          '@coveo/atomic#build',
          '@coveo/atomic#lint:check:all',
          '@coveo/atomic#publint',
          '@coveo/atomic#test',
        ],
        projects: ['@coveo/atomic', '@coveo/ui-kit-sample-atomic-search-vite'],
        samples: ['@coveo/ui-kit-sample-atomic-search-vite#e2e'],
      },
      mustExclude: {
        tasks: ['@coveo/quantic#e2e', '@coveo/quantic#promote:sfdx:ci'],
        projects: ['prettier'],
        samples: ['@samples/thermidor-search-react#e2e'],
      },
    },
    {
      name: 'unrelated Thermidor runtime dependency',
      filter: '@coveo/thermidor',
      importer: 'packages/thermidor',
      dependency: '@ag-ui/core',
      baselineVersion: '0.0.58',
      version: '0.0.57',
      mustInclude: {
        tasks: [
          '//#lint:check:all',
          '@coveo/quantic#lint:check:all',
          '@coveo/thermidor#build',
          '@coveo/thermidor#publint',
          '@coveo/thermidor#test',
        ],
        projects: ['@coveo/thermidor', '@samples/thermidor-search-react'],
        samples: ['@samples/thermidor-search-react#e2e'],
      },
      mustExclude: {
        tasks: ['@coveo/quantic#e2e', '@coveo/quantic#promote:sfdx:ci'],
        projects: ['@ag-ui/core'],
        samples: ['@coveo/ui-kit-sample-atomic-search-vite#e2e'],
      },
    },
  ];

  withIsolatedRepository(
    ({baseline, checkout}) => {
      const fixtureBaseline = prepareLockfileFixtureBaseline(checkout, baseline);
      for (const [index, scenario] of scenarios.entries()) {
        const head = scenario.capturedWaitOn
          ? createCapturedWaitOnHead(checkout, fixtureBaseline, scenario)
          : scenario.capturedAtomicPrettier
            ? createCapturedAtomicPrettierHead(checkout, fixtureBaseline, scenario)
            : generateLockfileOnlyHead(checkout, fixtureBaseline, scenario);
        runGit(checkout, ['checkout', '--quiet', '--detach', head]);
        const lockfileBeforeAction = readFileSync(resolve(checkout, 'pnpm-lock.yaml'));
        const actionResult = runAffectedCalculation(checkout, fixtureBaseline, head, {
          TURBO_CACHE_DIR: `/untrusted/cache/${index}`,
          TURBO_TOKEN: `untrusted-token-${index}`,
        });
        const {error, invocations, outputs, summary, temporaryDirectory} = actionResult;

        assert.equal(
          error,
          undefined,
          `${scenario.name}: ${error?.stderr ?? error?.message ?? ''}`
        );
        assert.equal(existsSync(temporaryDirectory), false);
        assert.deepEqual(readFileSync(resolve(checkout, 'pnpm-lock.yaml')), lockfileBeforeAction);
        assert.equal(outputs['fetch-depth'], 2);
        assertIncludesAndExcludes(scenario, outputs);
        assertSuccessfulInvocationOrder(invocations);
        assert.match(summary, /### Quantic E2E selection/);
        assert.match(summary, /TaskPackageDependencyChanged/);

        if (scenario.filter === '@coveo/quantic' || scenario.capturedWaitOn) {
          assert.ok(
            summary.includes(
              'Selected `@coveo/quantic#e2e` because these directly affected Turbo tasks reach it through declared task dependencies:'
            )
          );
          assert.ok(summary.includes(escapeMarkdownValue('@coveo/quantic#e2e')));
          assert.ok(summary.includes(escapeMarkdownValue('@coveo/quantic')));
        } else {
          assert.ok(
            summary.includes(
              'Skipped `@coveo/quantic#e2e` because no directly affected Turbo task reaches it through declared task dependencies.'
            )
          );
          assert.ok(summary.includes(escapeMarkdownValue(scenario.filter)));
        }

        if (index === 0) {
          const warmResult = runAffectedCalculation(checkout, fixtureBaseline, head, {
            GIT_WORK_TREE: '/untrusted/inherited/work-tree',
            TURBO_CACHE_DIR: '/different/untrusted/cache',
            TURBO_TOKEN: 'different-untrusted-token',
          });
          assert.equal(warmResult.error, undefined);
          assert.deepEqual(warmResult.outputs, outputs);
          assert.equal(warmResult.summary, summary);
          assertSuccessfulInvocationOrder(warmResult.invocations);
          assert.equal(existsSync(warmResult.temporaryDirectory), false);
        }
      }

      rmSync(resolve(checkout, '.turbo'), {recursive: true, force: true});
      assert.equal(existsSync(resolve(checkout, '.turbo')), false);
      rmSync(resolve(checkout, 'node_modules'), {recursive: true, force: true});
      assert.equal(existsSync(resolve(checkout, 'node_modules')), false);
    },
    {linkNodeModules: false}
  );
});

test('sanitizes hostile Turbo reason paths in the action summary', () => {
  withIsolatedRepository(
    ({baseline, checkout}) => {
      const maliciousPath = `packages/quantic/summary-\r\n# forged-<script>-\`code\`-\\-|-[x](y)-${'*'.repeat(80)}.txt`;
      const head = createCommit(
        checkout,
        baseline,
        (environment) => {
          const blob = runGit(checkout, ['hash-object', '-w', '--stdin'], {
            env: environment,
            input: 'hostile summary fixture\n',
          }).trim();
          runGit(
            checkout,
            ['update-index', '--add', '--cacheinfo', '100644', blob, maliciousPath],
            {
              env: environment,
            }
          );
        },
        'hostile affected path'
      );
      runGit(checkout, ['checkout', '--quiet', '--detach', head]);
      const {error, invocations, summary} = runAffectedCalculation(checkout, baseline, head);

      assert.equal(error, undefined);
      assertSuccessfulInvocationOrder(invocations);
      assert.ok(summary.includes(escapeMarkdownValue(maliciousPath)));
      assert.equal(summary.includes('<script>'), false);
      assert.equal(summary.includes('# forged'), false);
      assert.equal(summary.includes('[x](y)'), false);
    },
    {linkNodeModules: false}
  );
});

test('rejects frozen-valid noncanonical Turbo specs before pnpm dlx and output', () => {
  withIsolatedRepository(
    ({baseline, checkout}) => {
      const scenarios = [
        {name: 'aliased Turbo dependency', specifier: 'npm:turbo@2.10.9'},
        {name: 'ranged Turbo dependency', specifier: '^2.10.9'},
      ];

      for (const scenario of scenarios) {
        const head = createFrozenValidTurboSpecifierHead(
          checkout,
          baseline,
          scenario.specifier,
          scenario.name
        );
        const lockfileBeforeAction = readFileSync(resolve(checkout, 'pnpm-lock.yaml'));
        const {error, invocations, outputs, summary, temporaryDirectory} = runAffectedCalculation(
          checkout,
          baseline,
          head
        );

        assert.ok(error, `${scenario.name} should fail before pnpm dlx`);
        assert.match(
          `${error.stderr ?? ''}${error.stdout ?? ''}`,
          /repository-approved Turbo version/
        );
        assert.deepEqual(invocations, []);
        assert.deepEqual(outputs, {});
        assert.equal(summary, '');
        assert.deepEqual(readFileSync(resolve(checkout, 'pnpm-lock.yaml')), lockfileBeforeAction);
        assert.equal(existsSync(temporaryDirectory), false);
      }
      rmSync(resolve(checkout, 'node_modules'), {recursive: true, force: true});
      assert.equal(existsSync(resolve(checkout, 'node_modules')), false);
    },
    {linkNodeModules: false}
  );
});

test('rejects frozen-valid hostile task keys before Turbo and output', () => {
  withIsolatedRepository(
    ({baseline, checkout}) => {
      const scenarios = [
        {name: 'option-shaped task key', taskKey: '--cache=remote:rw', error: /CLI-option syntax/},
        {
          name: 'control-character task key',
          taskKey: 'build\n--cache=remote:rw',
          error: /control characters/,
        },
      ];

      for (const scenario of scenarios) {
        const head = createTurboTaskKeyHead(checkout, baseline, scenario.taskKey, scenario.name);
        const lockfileBeforeAction = readFileSync(resolve(checkout, 'pnpm-lock.yaml'));
        const {error, invocations, outputs, summary, temporaryDirectory} = runAffectedCalculation(
          checkout,
          baseline,
          head
        );

        assert.ok(error, `${scenario.name} should fail before Turbo`);
        assert.match(`${error.stderr ?? ''}${error.stdout ?? ''}`, scenario.error);
        assert.deepEqual(invocations, []);
        assert.deepEqual(outputs, {});
        assert.equal(summary, '');
        assert.deepEqual(readFileSync(resolve(checkout, 'pnpm-lock.yaml')), lockfileBeforeAction);
        assert.equal(existsSync(temporaryDirectory), false);
      }
      rmSync(resolve(checkout, 'node_modules'), {recursive: true, force: true});
      assert.equal(existsSync(resolve(checkout, 'node_modules')), false);
    },
    {linkNodeModules: false}
  );
});

test('fails semantic lockfile validation before Turbo and all GitHub output', () => {
  withIsolatedRepository(
    ({baseline, checkout}) => {
      const fixtureBaseline = prepareLockfileFixtureBaseline(checkout, baseline);
      const fixtureLock = parse(runGit(checkout, ['show', `${fixtureBaseline}:pnpm-lock.yaml`]));
      const dompurifyVersion =
        fixtureLock.importers['packages/quantic'].dependencies.dompurify.version;
      const scenarios = [
        {
          name: 'syntactically valid dangling snapshot',
          base: fixtureBaseline,
          transform: (lockfile) => removeLastYamlBlock(lockfile, `dompurify@${dompurifyVersion}`),
        },
        {
          name: 'importer specifier mismatch against exact Quantic manifest',
          base: baseline,
          transform: (lockfile) =>
            replaceImporterVersion(lockfile, 'packages/quantic', 'wait-on', '9.1.0', '8.0.5'),
        },
        {
          name: 'malformed pnpm lockfile',
          base: baseline,
          transform: () => "lockfileVersion: '9.0'\nimporters: [\n",
        },
        {
          name: 'unsupported pnpm lockfile version',
          base: baseline,
          transform: (lockfile) =>
            replaceOnce(lockfile, "lockfileVersion: '9.0'", "lockfileVersion: '99.0'"),
        },
      ];

      for (const scenario of scenarios) {
        runGit(checkout, ['checkout', '--quiet', '--detach', scenario.base]);
        const head = createFileContentsScenarioCommit(
          checkout,
          scenario.base,
          'pnpm-lock.yaml',
          scenario.transform,
          scenario.name
        );
        runGit(checkout, ['checkout', '--quiet', '--detach', head]);
        const lockfileBeforeAction = readFileSync(resolve(checkout, 'pnpm-lock.yaml'));
        const {error, invocations, outputs, summary, temporaryDirectory} = runAffectedCalculation(
          checkout,
          scenario.base,
          head
        );

        assert.ok(error, `${scenario.name} should fail semantic validation`);
        assert.match(
          `${error.stderr ?? ''}${error.stdout ?? ''}${error.message}`,
          /pnpm frozen lockfile validation (failed|modified)/
        );
        assert.deepEqual(
          invocations.map((invocation) => invocation.arguments),
          [[...pnpmLockfileValidationArguments]]
        );
        assertInvocationEnvironmentIsControlled(invocations);
        assert.deepEqual(outputs, {});
        assert.equal(summary, '');
        assert.deepEqual(readFileSync(resolve(checkout, 'pnpm-lock.yaml')), lockfileBeforeAction);
        assert.equal(existsSync(temporaryDirectory), false);
      }
      rmSync(resolve(checkout, 'node_modules'), {recursive: true, force: true});
      assert.equal(existsSync(resolve(checkout, 'node_modules')), false);
    },
    {linkNodeModules: false}
  );
});
