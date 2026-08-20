import {execFileSync} from 'node:child_process';
import {appendFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

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
const turboVersion = rootPackage.devDependencies.turbo;
const turboMaxBuffer = 100 * 1024 * 1024;

const turboCommand = (...args) => {
  return execFileSync('pnpm', ['dlx', `turbo@${turboVersion}`, ...args], {
    encoding: 'utf8',
    maxBuffer: turboMaxBuffer,
  });
};

const query = `
query {
  packages {
    items {
      name
      path
    }
  }
  affectedTasks(base: "${TURBO_SCM_BASE}", head: "${TURBO_SCM_HEAD}") {
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

const writeOutput = (name, value) => {
  appendFileSync(GITHUB_OUTPUT, `${name}=${JSON.stringify(value)}\n`);
};

// All packages / tasks

const getTurboFiles = (packages) => {
  return packages.map(({path}) => join(path, 'turbo.json')).filter((path) => existsSync(path));
};

const getAllTasks = (turboFiles) => {
  const tasks = new Set();

  for (const turboFile of turboFiles) {
    const {tasks: packageTasks = {}} = JSON.parse(readFileSync(turboFile, 'utf8'));
    for (const task of Object.keys(packageTasks)) {
      tasks.add(task.replace(/^\/\/#/, ''));
    }
  }

  return [...tasks].sort();
};

const allPackages = [...queryOutput.data.packages.items].sort(sortBy('name'));
const allTasks = getAllTasks(getTurboFiles(allPackages));

// Task graph

const getTasksGraph = (dryRun) => {
  return dryRun.tasks
    .sort(sortBy('taskId'))
    .map(({package: packageName, task, dependents}) => ({
      packageName,
      task,
      dependents,
    }))
    .reduce((graph, {packageName, task, dependents}) => {
      graph[packageName] ??= {};
      graph[packageName][task] = dependents;
      return graph;
    }, {});
};

const dryRun = JSON.parse(turboCommand('run', '--dry=json', ...allTasks));
const tasksGraph = getTasksGraph(dryRun);

// Affected tasks

/**
 * If a task is affected, all its dependents tasks are.
 * This is important because Turbo doesn't return tasks without a "command" in the output of affectedTasks.
 * You must attempt to call the tasks to know which dependencies are actually called.
 */
const expandAffectedTasks = (tasksGraph, affectedTasks) => {
  const affected = new Set(affectedTasks);
  const queue = [...affectedTasks];

  while (queue.length > 0) {
    const task = queue.shift();
    const [packageName, taskName] = task.split('#');
    const dependents = tasksGraph[packageName][taskName];

    for (const dependent of dependents) {
      if (!affected.has(dependent)) {
        affected.add(dependent);
        queue.push(dependent);
      }
    }
  }

  return [...affected].sort();
};

const packagesFromTasks = (taskIds) => {
  const packageNames = taskIds.map((taskId) => taskId.split('#')[0]);

  return [...new Set(packageNames)].sort();
};

const affectedTasks = [...queryOutput.data.affectedTasks.items].sort(sortBy('fullName'));
const affectedTaskNames = expandAffectedTasks(
  tasksGraph,
  affectedTasks.map(({fullName}) => fullName)
);
const affectedPackageNames = packagesFromTasks(affectedTaskNames);
const affectedSamples = affectedTaskNames.filter((fullName) =>
  /^@(samples\/|coveo\/ui-kit-sample-)[^#]+#e2e$/.test(fullName)
);

writeOutput('tasks', affectedTaskNames);
writeOutput('projects', affectedPackageNames);
writeOutput('samples', affectedSamples);

// Output markdown table for the run summary

const markdownTable = (headers, rows, quote = '') => {
  const header = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const processCell = (cell) => `${quote}${String(cell).replaceAll('|', '\\|')}${quote}`;
  const body = rows.map((row) => `| ${row.map(processCell).join(' | ')} |`).join('\n');

  return [header, separator, body, ''].join('\n');
};

const getSummaryDescription = (reason) => {
  if (reason.__typename === 'TaskDependencyTaskChanged') {
    return `${reason.packageName}#${reason.taskName}`;
  }

  return reason.description ?? reason.filePath ?? '';
};

// Don't use the "expanded" affected tasks here, it would far too noisy.
const affectedRows = affectedTasks.map(({package: packageInfo, name, reason}) => [
  packageInfo.name,
  name,
  reason.__typename,
  getSummaryDescription(reason),
]);

const summary = markdownTable(['package', 'task', 'reason', 'description'], affectedRows);
appendFileSync(GITHUB_STEP_SUMMARY, summary);

const githubRunUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
console.log(`Affected tasks summary: ${githubRunUrl}`);
