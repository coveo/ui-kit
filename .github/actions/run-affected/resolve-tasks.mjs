import {existsSync, globSync, readFileSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {parse} from 'yaml';

const root = resolve(process.env.GITHUB_WORKSPACE ?? process.cwd());

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

const matchesPackage = (project, packageName) => matchesPattern(project.name, packageName);

const parsePackages = (value) => {
  const packages = splitLines(value).map((packageName) => {
    const negative = packageName.startsWith('!');
    return {
      negative,
      pattern: packageName.slice(negative ? 1 : 0),
    };
  });

  const positive = packages.filter(({negative}) => !negative);
  const negative = packages.filter(({negative}) => negative);

  return (project) => {
    const included =
      positive.length === 0 || positive.some(({pattern}) => matchesPackage(project, pattern));
    const excluded = negative.some(({pattern}) => matchesPackage(project, pattern));
    return included && !excluded;
  };
};

const readPackage = (directory) => {
  const path = resolve(root, directory, 'package.json');
  const pkg = JSON.parse(readFileSync(path, 'utf8'));

  return {
    name: pkg.name,
    scripts: pkg.scripts ?? {},
  };
};

const readWorkspacePackages = () => {
  const workspace = parse(readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf8'));
  const directories = new Set(
    (workspace.packages ?? []).flatMap((pattern) => globSync(pattern, {cwd: root}))
  );
  return [...directories]
    .filter((directory) => statSync(resolve(root, directory)).isDirectory())
    .filter((directory) => existsSync(resolve(root, directory, 'package.json')))
    .map(readPackage);
};

const parseInputs = () => {
  const requestedTasks = splitLines(process.env.TASKS || 'build');
  const matchesPackage = parsePackages(process.env.PACKAGES);

  const affectedInput = process.env.AFFECTED_TASKS ?? '';
  const affectedTasks = affectedInput == '' ? null : JSON.parse(affectedInput);

  if (
    affectedInput != '' &&
    (!Array.isArray(affectedTasks) || affectedTasks.some((task) => typeof task !== 'string'))
  ) {
    throw new TypeError('AFFECTED_TASKS must be a JSON array of strings.');
  }

  return {requestedTasks, matchesPackage, affectedTasks};
};

const resolveTasks = () => {
  const {requestedTasks, matchesPackage, affectedTasks} = parseInputs();
  const packages = readWorkspacePackages();
  const projects = matchesPackage ? packages.filter(matchesPackage) : packages;
  const tasks = projects.flatMap((project) =>
    Object.keys(project.scripts).map((task) => ({project, task}))
  );

  return tasks
    .filter(({task}) => requestedTasks.includes(task))
    .map(({project, task}) => `${project.name}#${task}`)
    .filter((task) => affectedTasks === null || affectedTasks.includes(task))
    .sort();
};

const tasks = resolveTasks();
console.error(`tasks:`);
for (const task of tasks) {
  console.error(task);
  console.log(task);
}
