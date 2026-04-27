#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';

const CHANGESET_PATH = '.changeset/bump-prod-deps.md';
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

const mergedPackages = new Set([
  ...readExistingChangesetPackages(CHANGESET_PATH),
  ...updatedPublicPackages,
]);

const nextContent = buildChangesetContent(
  [...mergedPackages].sort((a, b) => a.localeCompare(b))
);
const previousContent = existsSync(CHANGESET_PATH)
  ? readFileSync(CHANGESET_PATH, 'utf8')
  : null;

if (previousContent === nextContent) {
  process.exit(0);
}

writeFileSync(CHANGESET_PATH, nextContent);

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

function readExistingChangesetPackages(filePath) {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf8');
  const frontmatterMatch = content.match(/---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return [];
  }

  return Array.from(
    frontmatterMatch[1].matchAll(/['"]([^'"]+)['"]\s*:\s*patch\s*$/gm),
    (match) => match[1]
  );
}

function buildChangesetContent(packageNames) {
  const packageLines = packageNames
    .map((packageName) => `'${packageName}': patch`)
    .join('\n');
  return `---\n${packageLines}\n---\n\nUpdate production dependencies\n`;
}
