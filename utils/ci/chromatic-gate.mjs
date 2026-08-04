import {execFileSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {parse as parseYaml} from 'yaml';

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];
const lockDependencySections = ['dependencies', 'devDependencies', 'optionalDependencies'];
const localProtocolPattern = /^(workspace:|link:|file:|portal:)/;
const dependencyInputPaths = new Set([
  'packages/atomic/package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
]);

const stable = (value) => JSON.stringify(value, Object.keys(value ?? {}).sort());

const catalogVersion = (workspace, dependency, specifier) => {
  if (!specifier.startsWith('catalog:')) {
    return specifier;
  }

  const catalogName = specifier.slice('catalog:'.length);
  const catalog = catalogName ? workspace.catalogs?.[catalogName] : workspace.catalog;
  const version = catalog?.[dependency];

  if (!version) {
    throw new Error(`Could not resolve ${dependency} from ${specifier}`);
  }

  return `catalog:${catalogName}:${version}`;
};

const directExternalDependencies = (manifest) => {
  const dependencies = new Map();

  for (const section of dependencySections) {
    for (const [dependency, specifier] of Object.entries(manifest[section] ?? {})) {
      if (localProtocolPattern.test(specifier)) {
        continue;
      }

      const entry = dependencies.get(dependency) ?? {sections: new Set(), specifiers: []};
      entry.sections.add(section);
      entry.specifiers.push({section, specifier});
      dependencies.set(dependency, entry);
    }
  }

  return dependencies;
};

const lockVersion = (entry) => {
  if (typeof entry === 'string') {
    return entry;
  }

  return entry?.version ?? null;
};

const dependencyState = ({dependency, directDependency, manifest, workspace, lock}) => {
  if (!directDependency) {
    return null;
  }

  const importer = lock.importers?.['packages/atomic'];
  if (!importer) {
    throw new Error('Missing packages/atomic importer in pnpm-lock.yaml');
  }

  const specifiers = directDependency.specifiers
    .map(({section, specifier}) => `${section}:${catalogVersion(workspace, dependency, specifier)}`)
    .sort();
  const lockVersions = [];

  for (const section of lockDependencySections) {
    if (!directDependency.sections.has(section)) {
      continue;
    }

    const version = lockVersion(importer[section]?.[dependency]);
    if (!version) {
      throw new Error(`Missing ${dependency} resolution in ${section}`);
    }
    lockVersions.push(`${section}:${version}`);
  }

  return {specifiers, lockVersions: lockVersions.sort()};
};

export const evaluateChromaticGate = ({changedFiles, base, head}) => {
  const atomicChanged = changedFiles.some((file) => file.startsWith('packages/atomic/'));
  const dependencyInputsChanged = changedFiles.some((file) => dependencyInputPaths.has(file));

  if (!dependencyInputsChanged) {
    return {
      shouldRun: atomicChanged,
      dependencyChanged: false,
      reasons: atomicChanged ? ['atomic-changed'] : [],
    };
  }

  try {
    const baseDependencies = directExternalDependencies(base.manifest);
    const headDependencies = directExternalDependencies(head.manifest);
    const dependencies = new Set([...baseDependencies.keys(), ...headDependencies.keys()]);
    const changedDependencies = [];

    for (const dependency of dependencies) {
      const baseState = dependencyState({
        dependency,
        directDependency: baseDependencies.get(dependency),
        manifest: base.manifest,
        workspace: base.workspace,
        lock: base.lock,
      });
      const headState = dependencyState({
        dependency,
        directDependency: headDependencies.get(dependency),
        manifest: head.manifest,
        workspace: head.workspace,
        lock: head.lock,
      });

      if (stable(baseState) !== stable(headState)) {
        changedDependencies.push(dependency);
      }
    }

    return {
      shouldRun: atomicChanged || changedDependencies.length > 0,
      dependencyChanged: changedDependencies.length > 0,
      reasons: [...(atomicChanged ? ['atomic-changed'] : []), ...changedDependencies],
    };
  } catch (error) {
    return {
      shouldRun: true,
      dependencyChanged: true,
      reasons: [`invalid-dependency-state:${error.message}`],
    };
  }
};

const git = (args) =>
  execFileSync('git', args, {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024}).trim();

const gitFile = (sha, path) => git(['show', `${sha}:${path}`]);

const readState = (sha) => ({
  manifest: JSON.parse(gitFile(sha, 'packages/atomic/package.json')),
  workspace: parseYaml(gitFile(sha, 'pnpm-workspace.yaml')),
  lock: parseYaml(gitFile(sha, 'pnpm-lock.yaml')),
});

const writeOutput = (result) => {
  const output = [
    `should_run=${result.shouldRun}`,
    `dependency_changed=${result.dependencyChanged}`,
    `reasons=${result.reasons.join(',')}`,
  ].join('\n');

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [baseFlag, base, headFlag, head] = process.argv.slice(2);

  if (baseFlag !== '--base' || headFlag !== '--head') {
    throw new Error('Usage: node chromatic-gate.mjs --base <sha> --head <sha>');
  }

  let result;
  if (!base || !head) {
    result = {
      shouldRun: true,
      dependencyChanged: true,
      reasons: ['invalid-git-state:missing-base-or-head'],
    };
  } else {
    try {
      const changedFiles = git(['diff', '--name-only', '--no-renames', `${base}..${head}`])
        .split('\n')
        .filter(Boolean);
      result = evaluateChromaticGate({changedFiles, base: readState(base), head: readState(head)});
    } catch (error) {
      result = {
        shouldRun: true,
        dependencyChanged: true,
        reasons: [`invalid-git-state:${error.message}`],
      };
    }
  }

  writeOutput(result);
}
