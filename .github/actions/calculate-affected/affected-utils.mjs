export const approvedTurboVersion = '2.10.9';
export const quanticE2ETask = '@coveo/quantic#e2e';
export const pnpmLockfileValidationArguments = Object.freeze([
  'install',
  '--lockfile-only',
  '--frozen-lockfile',
  '--ignore-scripts',
]);

const defaultGraphLimits = Object.freeze({
  tasks: 20_000,
  edges: 200_000,
});
const markdownValueLengthLimit = 512;
const markdownEllipsis = '&#8230;';
const rootTurboTaskPrefix = '//#';
const turboTaskNameLengthLimit = 128;
const turboTaskNamePattern = /^[a-z0-9]+(?:(?::|-)[a-z0-9]+)*$/u;

const taskIdFromParts = (packageName, taskName) => `${packageName}#${taskName}`;

const isControlCharacter = (character) => {
  const codePoint = character.codePointAt(0);
  return codePoint <= 31 || (codePoint >= 127 && codePoint <= 159);
};

export const assertApprovedTurboVersion = (configuredVersion) => {
  if (configuredVersion !== approvedTurboVersion) {
    throw new Error(
      'package.json must declare the repository-approved Turbo version exactly as 2.10.9.'
    );
  }
};

export const normalizeTurboTaskKey = (taskKey) => {
  if (typeof taskKey !== 'string' || taskKey.length === 0) {
    throw new Error('Turbo task keys must be non-empty strings.');
  }
  if ([...taskKey].some(isControlCharacter)) {
    throw new Error('Turbo task keys must not contain control characters.');
  }

  const taskName = taskKey.startsWith(rootTurboTaskPrefix)
    ? taskKey.slice(rootTurboTaskPrefix.length)
    : taskKey;
  if (taskName.startsWith('-') || taskName.includes('=')) {
    throw new Error('Turbo task keys must not use CLI-option syntax.');
  }
  if (taskName.length > turboTaskNameLengthLimit || !turboTaskNamePattern.test(taskName)) {
    throw new Error('Turbo task key does not match the repository task-name grammar.');
  }

  return taskName;
};

const validateString = (value, label) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid Turbo graph ${label}.`);
  }
};

const traverse = (roots, edgesByTask, edgeLimit) => {
  const visited = new Set(roots);
  const queue = [...roots];
  const traversalLimit = edgesByTask.size + edgeLimit;
  let traversalSteps = 0;
  let visitedEdges = 0;

  for (let index = 0; index < queue.length; index += 1) {
    traversalSteps += 1;
    const task = queue[index];
    for (const adjacentTask of edgesByTask.get(task)) {
      traversalSteps += 1;
      visitedEdges += 1;
      if (traversalSteps > traversalLimit || visitedEdges > edgeLimit) {
        throw new Error('Turbo graph traversal exceeded its validated V+E bound.');
      }
      if (!visited.has(adjacentTask)) {
        visited.add(adjacentTask);
        queue.push(adjacentTask);
      }
    }
  }

  if (queue.length > edgesByTask.size) {
    throw new Error('Turbo graph traversal exceeded its validated task bound.');
  }

  return visited;
};

export const analyzeTaskGraph = (
  turboTasks,
  directlyAffectedTaskNames,
  target = quanticE2ETask,
  limits = defaultGraphLimits
) => {
  if (!Array.isArray(turboTasks) || turboTasks.length > limits.tasks) {
    throw new Error('Turbo returned an invalid or oversized task graph.');
  }

  const dependentsByTask = new Map();
  const dependenciesByTask = new Map();
  let edgeCount = 0;

  for (const turboTask of turboTasks) {
    const {dependents, package: packageName, task: taskName, taskId} = turboTask ?? {};
    validateString(packageName, 'package name');
    validateString(taskName, 'task name');
    validateString(taskId, 'task identifier');
    if (taskId !== taskIdFromParts(packageName, taskName)) {
      throw new Error(`Turbo graph task identifier does not match its package and task: ${taskId}`);
    }
    if (
      !Array.isArray(dependents) ||
      dependents.some((dependent) => typeof dependent !== 'string')
    ) {
      throw new Error(`Turbo graph task has invalid dependents: ${taskId}`);
    }
    if (new Set(dependents).size !== dependents.length) {
      throw new Error(`Turbo graph task has duplicate dependents: ${taskId}`);
    }
    if (dependentsByTask.has(taskId)) {
      throw new Error(`Turbo graph contains a duplicate task: ${taskId}`);
    }

    edgeCount += dependents.length;
    if (edgeCount > limits.edges) {
      throw new Error('Turbo returned an oversized task graph.');
    }
    dependentsByTask.set(taskId, [...dependents]);
    dependenciesByTask.set(taskId, []);
  }

  validateString(target, 'target task');
  if (!dependentsByTask.has(target)) {
    throw new Error(`Turbo graph is missing the selection target: ${target}`);
  }

  for (const [taskId, dependents] of dependentsByTask) {
    for (const dependent of dependents) {
      if (!dependentsByTask.has(dependent)) {
        throw new Error(`Turbo graph contains a dangling dependent: ${taskId} -> ${dependent}`);
      }
      dependenciesByTask.get(dependent).push(taskId);
    }
  }

  if (!Array.isArray(directlyAffectedTaskNames)) {
    throw new Error('Turbo returned invalid directly affected tasks.');
  }
  const directlyAffected = new Set();
  for (const taskId of directlyAffectedTaskNames) {
    validateString(taskId, 'directly affected task');
    if (!dependentsByTask.has(taskId)) {
      throw new Error(`Directly affected task is missing from the Turbo graph: ${taskId}`);
    }
    directlyAffected.add(taskId);
  }

  const affected = traverse(directlyAffected, dependentsByTask, edgeCount);
  const targetAncestors = traverse([target], dependenciesByTask, edgeCount);
  const triggerTaskNames = [...directlyAffected].filter((taskId) => targetAncestors.has(taskId));
  const selected = affected.has(target);

  if (selected && triggerTaskNames.length === 0) {
    throw new Error(`Turbo selected ${target} without an affected dependency path.`);
  }

  return {
    affectedTaskNames: [...affected].sort(),
    selected,
    triggerTaskNames: triggerTaskNames.sort(),
  };
};

export const packagesFromTasks = (taskIds) => {
  const packageNames = taskIds.map((taskId) => {
    const separator = taskId.lastIndexOf('#');
    if (separator < 1 || separator === taskId.length - 1) {
      throw new Error(`Invalid Turbo task identifier: ${taskId}`);
    }
    return taskId.slice(0, separator);
  });

  return [...new Set(packageNames)].sort();
};

export const escapeMarkdownValue = (value) => {
  const normalized = [...String(value ?? '')]
    .map((character) => (isControlCharacter(character) ? ' ' : character))
    .join('')
    .replace(/\s+/gu, ' ')
    .trim();
  let escaped = '';

  for (const character of normalized) {
    const token = /^[a-z0-9 ]$/iu.test(character) ? character : `&#${character.codePointAt(0)};`;
    if (escaped.length + token.length > markdownValueLengthLimit - markdownEllipsis.length) {
      return `${escaped}${markdownEllipsis}`;
    }
    escaped += token;
  }

  return escaped;
};

export const markdownTable = (headers, rows) => {
  const header = `| ${headers.map(escapeMarkdownValue).join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escapeMarkdownValue).join(' | ')} |`).join('\n');

  return [header, separator, body, ''].join('\n');
};

export const getSummaryDescription = (reason) => {
  if (reason.__typename === 'TaskDependencyTaskChanged') {
    return `${reason.packageName}#${reason.taskName}`;
  }

  if (reason.__typename === 'TaskPackageDependencyChanged') {
    return reason.packageName;
  }

  return reason.description ?? reason.filePath ?? '';
};
