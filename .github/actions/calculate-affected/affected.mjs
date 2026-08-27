import {execFileSync} from 'node:child_process';
import {appendFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

import {
  analyzeTaskGraph,
  approvedTurboVersion,
  assertApprovedTurboVersion,
  escapeMarkdownValue,
  getSummaryDescription,
  markdownTable,
  normalizeTurboTaskKey,
  packagesFromTasks,
  pnpmLockfileValidationArguments,
  quanticE2ETask,
} from './affected-utils.mjs';

const {
  GITHUB_OUTPUT,
  GITHUB_REPOSITORY,
  GITHUB_RUN_ID,
  GITHUB_SERVER_URL,
  GITHUB_STEP_SUMMARY,
  TURBO_SCM_BASE,
  TURBO_SCM_HEAD,
} = process.env;

const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
const lockfilePath = 'pnpm-lock.yaml';
const commandMaxBuffer = 100 * 1024 * 1024;

assertApprovedTurboVersion(rootPackage.devDependencies?.turbo);

const getAllTasks = (turboFiles) => {
  const tasks = new Set();
  for (const turboFile of turboFiles) {
    const {tasks: packageTasks = {}} = JSON.parse(readFileSync(turboFile, 'utf8'));
    for (const task of Object.keys(packageTasks)) {
      tasks.add(normalizeTurboTaskKey(task));
    }
  }
  return [...tasks].sort();
};

getAllTasks(['turbo.json']);

const controlledCommandEnvironment = () => {
  const environment = {...process.env};
  for (const name of Object.keys(environment)) {
    if (name.startsWith('GIT_') || name.startsWith('TURBO_')) {
      delete environment[name];
    }
  }
  environment.TURBO_TELEMETRY_DISABLED = '1';
  environment.TURBO_UI = 'false';
  return environment;
};

const gitCommand = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    env: {
      ...controlledCommandEnvironment(),
      GIT_NO_LAZY_FETCH: '1',
    },
    maxBuffer: commandMaxBuffer,
  }).trim();

const restoreLockfile = (originalLockfile) => {
  let currentLockfile;
  try {
    currentLockfile = readFileSync(lockfilePath);
  } catch {
    writeFileSync(lockfilePath, originalLockfile);
    return true;
  }

  if (!currentLockfile.equals(originalLockfile)) {
    writeFileSync(lockfilePath, originalLockfile);
    return true;
  }

  return false;
};

const validatePnpmLockfile = () => {
  const originalLockfile = readFileSync(lockfilePath);
  let validationError;

  try {
    execFileSync('pnpm', pnpmLockfileValidationArguments, {
      env: controlledCommandEnvironment(),
      stdio: 'inherit',
    });
  } catch (error) {
    validationError = error;
  }

  const lockfileWasChanged = restoreLockfile(originalLockfile);
  if (validationError) {
    throw new Error(
      'pnpm frozen lockfile validation failed; refusing to calculate or publish affected outputs.',
      {cause: validationError}
    );
  }
  if (lockfileWasChanged) {
    throw new Error(
      'pnpm frozen lockfile validation modified pnpm-lock.yaml; the original bytes were restored and no affected outputs were published.'
    );
  }
};

gitCommand('rev-parse', '--verify', '--end-of-options', `${TURBO_SCM_BASE}^{commit}`);
gitCommand('rev-parse', '--verify', '--end-of-options', `${TURBO_SCM_HEAD}^{commit}`);
const commitCount = Number.parseInt(
  gitCommand('rev-list', '--count', '--end-of-options', `${TURBO_SCM_BASE}..${TURBO_SCM_HEAD}`),
  10
);
if (!Number.isSafeInteger(commitCount) || commitCount < 0) {
  throw new Error('Git returned an invalid affected-range commit count.');
}
const fetchDepth = commitCount + 1;

validatePnpmLockfile();

const lockfileVersion = readFileSync(lockfilePath, 'utf8').match(
  /^lockfileVersion:\s*['"]?([^'"\s]+)['"]?\s*$/m
)?.[1];
if (lockfileVersion !== '9.0') {
  throw new Error(
    `Unsupported or malformed pnpm lockfile version: ${lockfileVersion ?? 'missing'}. Refusing to publish an indeterminate affected set.`
  );
}

const turboCommand = (...args) =>
  execFileSync('pnpm', ['dlx', `turbo@${approvedTurboVersion}`, ...args], {
    encoding: 'utf8',
    env: controlledCommandEnvironment(),
    maxBuffer: commandMaxBuffer,
  });

const query = `
query {
  packages {
    items {
      name
      path
    }
  }
  affectedTasks(base: ${JSON.stringify(TURBO_SCM_BASE)}, head: ${JSON.stringify(TURBO_SCM_HEAD)}) {
    items {
      name
      fullName
      package {
        name
      }
      reason {
        __typename
        ... on TaskFileChanged { filePath }
        ... on TaskDependencyTaskChanged { taskName packageName }
        ... on TaskPackageDependencyChanged { packageName }
        ... on TaskGlobalFileChanged { filePath }
        ... on TaskGlobalDepsChanged { filePath }
        ... on TaskAllChanged { description }
      }
    }
  }
}
`;
const queryOutput = JSON.parse(turboCommand('query', '--no-update-notifier', query));
const sortBy = (property) => (left, right) => left[property].localeCompare(right[property]);
const affectedTasks = [...queryOutput.data.affectedTasks.items].sort(sortBy('fullName'));
const lockfileResolutionFailure = affectedTasks.find(
  ({reason}) =>
    reason.__typename === 'TaskAllChanged' &&
    reason.description === 'lockfile change detection failed'
);
if (lockfileResolutionFailure) {
  throw new Error(
    'Turbo lockfile change detection failed; refusing to publish an indeterminate affected set.'
  );
}

const getTurboFiles = (packages) =>
  packages.map(({path}) => join(path, 'turbo.json')).filter((path) => existsSync(path));

const allPackages = [...queryOutput.data.packages.items].sort(sortBy('name'));
const allTasks = getAllTasks(getTurboFiles(allPackages));
const dryRun = JSON.parse(turboCommand('run', '--dry=json', '--cache=local:rw', ...allTasks));
const graphAnalysis = analyzeTaskGraph(
  dryRun.tasks,
  affectedTasks.map(({fullName}) => fullName)
);
const affectedTaskNames = graphAnalysis.affectedTaskNames;
const affectedPackageNames = packagesFromTasks(affectedTaskNames);
const affectedSamples = affectedTaskNames.filter((fullName) =>
  /^@(samples\/|coveo\/ui-kit-sample-)[^#]+#e2e$/.test(fullName)
);

const getQuanticE2ESummary = () => {
  if (!graphAnalysis.selected) {
    return '### Quantic E2E selection\n\nSkipped `@coveo/quantic#e2e` because no directly affected Turbo task reaches it through declared task dependencies.\n';
  }

  const affectedByFullName = new Map(affectedTasks.map((task) => [task.fullName, task]));
  const displayedTriggers = graphAnalysis.triggerTaskNames.slice(0, 5).map((fullName) => {
    const trigger = affectedByFullName.get(fullName);
    if (!trigger) {
      throw new Error(`Quantic E2E trigger is missing its Turbo affected reason: ${fullName}`);
    }
    const description = getSummaryDescription(trigger.reason);
    const detail = description ? `: ${escapeMarkdownValue(description)}` : '';
    return `- ${escapeMarkdownValue(fullName)} — ${escapeMarkdownValue(trigger.reason.__typename)}${detail}`;
  });
  const additionalTriggerCount = graphAnalysis.triggerTaskNames.length - displayedTriggers.length;
  if (additionalTriggerCount > 0) {
    displayedTriggers.push(
      `- ${escapeMarkdownValue(additionalTriggerCount)} additional affected task path(s)`
    );
  }

  return [
    '### Quantic E2E selection',
    '',
    'Selected `@coveo/quantic#e2e` because these directly affected Turbo tasks reach it through declared task dependencies:',
    ...displayedTriggers,
    '',
  ].join('\n');
};

const affectedRows = affectedTasks.map(({package: packageInfo, name, reason}) => [
  packageInfo.name,
  name,
  reason.__typename,
  getSummaryDescription(reason),
]);
const summary = `${getQuanticE2ESummary()}\n${markdownTable(
  ['package', 'task', 'reason', 'description'],
  affectedRows
)}`;
const serializedOutputs = [
  ['fetch-depth', fetchDepth],
  ['tasks', affectedTaskNames],
  ['projects', affectedPackageNames],
  ['samples', affectedSamples],
]
  .map(([name, value]) => `${name}=${JSON.stringify(value)}\n`)
  .join('');

appendFileSync(GITHUB_STEP_SUMMARY, summary);
appendFileSync(GITHUB_OUTPUT, serializedOutputs);

const githubRunUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
console.log(`Affected tasks summary: ${githubRunUrl}`);
