#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const CHANGESET_RELATIVE_PATH = '.changeset/bump-prod-deps.md';
const PROD_DEP_FIELDS = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
];

const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA;

if (!baseSha || !headSha) {
  throw new Error('BASE_SHA and HEAD_SHA must be provided');
}

const repositoryRoot = git(['rev-parse', '--show-toplevel']);
const changesetPath = join(repositoryRoot, CHANGESET_RELATIVE_PATH);

const changedFiles = git(['diff', '--name-only', baseSha, headSha])
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const changedPackageJsonFiles = changedFiles.filter((filePath) =>
  filePath.endsWith('/package.json')
);

const updatedPublicPackages = new Set();

for (const filePath of changedPackageJsonFiles) {
  const previousManifest = readJsonAtRef(baseSha, filePath);
  const nextManifest = readJsonAtRef(headSha, filePath);

  if (
    !nextManifest ||
    !hasProdDependencyChange(previousManifest, nextManifest)
  ) {
    continue;
  }

  if (!isPublicPackageManifestPath(filePath) || nextManifest.private === true) {
    continue;
  }

  if (typeof nextManifest.name === 'string' && nextManifest.name.length > 0) {
    updatedPublicPackages.add(nextManifest.name);
  }
}

if (updatedPublicPackages.size === 0) {
  process.exit(0);
}

const mergedEntries = new Map(readExistingChangesetEntries(changesetPath));
for (const packageName of updatedPublicPackages) {
  const existingBumpType = mergedEntries.get(packageName);
  mergedEntries.set(
    packageName,
    keepHighestBumpType(existingBumpType, 'patch')
  );
}

const nextContent = buildChangesetContent(
  [...mergedEntries.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  )
);
const previousContent = existsSync(changesetPath)
  ? readFileSync(changesetPath, 'utf8')
  : null;

if (previousContent === nextContent) {
  process.exit(0);
}

mkdirSync(dirname(changesetPath), {recursive: true});
writeFileSync(changesetPath, nextContent);

function git(args) {
  return execFileSync('git', args, {encoding: 'utf8'}).trim();
}

function readJsonAtRef(ref, filePath) {
  try {
    const raw = execFileSync('git', ['show', `${ref}:${filePath}`], {
      encoding: 'utf8',
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasProdDependencyChange(previousManifest, nextManifest) {
  return PROD_DEP_FIELDS.some((field) => {
    const previousDeps = dependencyMap(previousManifest?.[field]);
    const nextDeps = dependencyMap(nextManifest?.[field]);
    const keys = new Set([
      ...Object.keys(previousDeps),
      ...Object.keys(nextDeps),
    ]);

    for (const key of keys) {
      if ((previousDeps[key] ?? null) !== (nextDeps[key] ?? null)) {
        return true;
      }
    }

    return false;
  });
}

function dependencyMap(value) {
  return value && typeof value === 'object' ? value : {};
}

function isPublicPackageManifestPath(filePath) {
  return /^packages\/[^/]+\/package\.json$/.test(filePath);
}

function readExistingChangesetEntries(filePath) {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf8');
  const frontmatterMatch = content.match(/---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return [];
  }

  return Array.from(
    frontmatterMatch[1].matchAll(
      /['"]([^'"]+)['"]\s*:\s*([A-Za-z][A-Za-z-]*)\s*$/gm
    ),
    (match) => [match[1], match[2]]
  );
}

function keepHighestBumpType(existingBumpType, nextBumpType) {
  if (!existingBumpType) {
    return nextBumpType;
  }

  const existingPriority = getBumpPriority(existingBumpType);
  const nextPriority = getBumpPriority(nextBumpType);

  if (existingPriority === 0 || nextPriority === 0) {
    return existingBumpType;
  }

  return existingPriority >= nextPriority ? existingBumpType : nextBumpType;
}

function getBumpPriority(bumpType) {
  switch (bumpType) {
    case 'patch':
      return 1;
    case 'minor':
      return 2;
    case 'major':
      return 3;
    default:
      return 0;
  }
}

function buildChangesetContent(changesetEntries) {
  const packageLines = changesetEntries
    .map(([packageName, bumpType]) => `'${packageName}': ${bumpType}`)
    .join('\n');
  return `---\n${packageLines}\n---\n\nUpdate production dependencies\n`;
}
