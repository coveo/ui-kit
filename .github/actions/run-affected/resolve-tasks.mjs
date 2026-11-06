import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {join} from 'node:path';

const splitLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const escapeRegExp = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');

const globToRegExp = (pattern) => {
  let source = '';
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character !== '*') {
      source += escapeRegExp(character);
      continue;
    }
    source += '[^/]*';
  }
  return new RegExp(`^${source}$`);
};

const matchesPattern = (value, pattern) => globToRegExp(pattern).test(value);

const parsePackages = (value) => {
  const rules = splitLines(value).map((packageName) => {
    const included = !packageName.startsWith('!');
    return {
      included,
      pattern: packageName.slice(included ? 0 : 1),
    };
  });

  // If it contains any "inclusion" rules, default to false
  // Otherwise (including if empty), default to true
  const defaultIncluded = !rules.some((rule) => rule.included);

  return (project) => {
    let included = defaultIncluded;
    // Last rule wins
    for (const rule of rules) {
      if (matchesPattern(project, rule.pattern)) {
        included = rule.included;
      }
    }
    return included;
  };
};

const parseJsonInput = (varName) => {
  const input = process.env[varName] ?? '';

  if (input === '') {
    throw new TypeError(`${varName} must be defined.`);
  }

  let value;

  try {
    value = JSON.parse(input);
  } catch (error) {
    throw new TypeError(`${varName} is not valid JSON: ${error}`);
  }

  if (value === null) {
    throw new TypeError(`${varName} must be defined.`);
  }

  return value;
};

// The affected tasks come from the merge commit, while some jobs check out the
// pull request branch, which may lack packages or tasks added to the base
// branch since. Turbo fails on any task ID it can't find in the checkout.
const getCheckoutTaskIds = (taskNames) => {
  const turbo = createRequire(join(process.cwd(), 'package.json')).resolve('turbo');
  const output = execFileSync(
    process.execPath,
    [turbo, 'run', ...taskNames, '--dry=json', '--no-update-notifier'],
    {encoding: 'utf8', maxBuffer: 100 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']}
  );
  return new Set(JSON.parse(output).tasks.map(({taskId}) => taskId));
};

const parseInputs = () => ({
  requestedTasks: new Set(splitLines(process.env.TASKS || 'build')),
  matchesPackage: parsePackages(process.env.PACKAGES),
  affectedTasks: parseJsonInput('AFFECTED_TASKS'),
});

const resolveTasks = () => {
  const {requestedTasks, matchesPackage, affectedTasks} = parseInputs();
  const candidates = affectedTasks.filter((taskId) => {
    const [project, task] = taskId.split('#');
    return requestedTasks.has(task) && matchesPackage(project);
  });

  if (candidates.length === 0) {
    return [];
  }

  const taskNames = [...new Set(candidates.map((taskId) => taskId.split('#')[1]))];
  const checkoutTaskIds = getCheckoutTaskIds(taskNames);
  const tasks = [];

  for (const taskId of candidates) {
    if (checkoutTaskIds.has(taskId)) {
      tasks.push(taskId);
    } else {
      console.error(
        `::warning title=Skipped affected task::${taskId} is not in this checkout, so it was not run.`
      );
    }
  }

  return tasks;
};

const tasks = resolveTasks();
console.error(`tasks:`);
for (const task of tasks) {
  console.error(task);
  console.log(task);
}
