import {execFileSync} from 'node:child_process';
import {join, relative, resolve, sep} from 'node:path';

const root = resolve(process.env.GITHUB_WORKSPACE ?? process.cwd());
const buildTaskSuffix = '#build';
const turboMaxBuffer = 100 * 1024 * 1024;

const parseAffectedTasks = () => {
  const input = process.env.AFFECTED_TASKS ?? '';
  const affectedTasks = JSON.parse(input);

  if (!Array.isArray(affectedTasks) || affectedTasks.some((task) => typeof task !== 'string')) {
    throw new TypeError('AFFECTED_TASKS must be a JSON array of strings.');
  }

  return affectedTasks;
};

const resolveAffectedTasks = () => {
  const affectedTasks = parseAffectedTasks().filter((task) => task.endsWith(buildTaskSuffix));

  if (affectedTasks.length === 0) {
    return [];
  }

  const output = execFileSync('pnpm', ['exec', 'turbo', 'run', ...affectedTasks, '--dry=json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: turboMaxBuffer,
  });
  const dryRun = JSON.parse(output);
  const taskIds = dryRun.tasks.map(({taskId}) => taskId);

  return taskIds;
};

const getWorkspacePackages = () => {
  const output = execFileSync('pnpm', ['list', '--recursive', '--depth', '-1', '--json'], {
    cwd: root,
    encoding: 'utf8',
  });
  const packages = JSON.parse(output);

  return new Map(packages.map((workspacePackage) => [workspacePackage.name, workspacePackage]));
};

const toWorkspacePath = (workspacePackage) => {
  const relativePath = join(relative(root, workspacePackage.path));
  return `.${sep}${relativePath}`;
};

const isSamplePackage = (workspacePackage) =>
  relative(root, workspacePackage.path).split(sep)[0] === 'samples';

const shouldPublishPackage = (workspacePackage) => {
  return !workspacePackage.private && !isSamplePackage(workspacePackage);
};

const getAffectedPackages = () => {
  const tasks = resolveAffectedTasks();
  const projects = tasks
    .map((task) => task.split('#')[0])
    .filter((packageName) => packageName !== '//');

  return new Set(projects);
};

const resolvePreviewPackages = () => {
  const workspacePackages = getWorkspacePackages();

  return [...getAffectedPackages()]
    .map((packageName) => {
      if (!workspacePackages.has(packageName)) {
        throw new Error(`Could not resolve affected workspace package: ${packageName}`);
      }
      return workspacePackages.get(packageName);
    })
    .filter(shouldPublishPackage)
    .map(toWorkspacePath)
    .sort();
};

const packages = resolvePreviewPackages();
console.error(`Preview packages${packages.length === 0 ? '' : ':'}`);
for (const packagePath of packages) {
  console.error(packagePath);
  console.log(packagePath);
}
