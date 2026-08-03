import {globSync} from 'node:fs';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = process.cwd();
const WORKSPACE_FILE = join(ROOT, 'pnpm-workspace.yaml');

// Dependencies that are allowed to keep a literal/range version in more than
// one manifest even though pnpm's catalog: protocol would otherwise apply.
// Each entry must reference a rationale so the exception stays intentional.
const ALLOWED_DRIFT = new Set([
  // ESM-only (headless) vs CJS (coveo-analytics); aligning majors requires a
  // module-format migration, tracked separately from KIT-5960.
  'node-fetch',
  // Actively being consolidated in a dedicated PR; excluded here to avoid
  // conflicting changes.
  'uuid',
]);

function parseWorkspacePackages(yamlText) {
  const lines = yamlText.split('\n');
  const packages = [];
  let inPackages = false;
  for (const line of lines) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      if (/^\S/.test(line)) break; // dedented, section over
      const match = line.match(/^\s*-\s*(.+?)\s*$/);
      if (match) {
        packages.push(match[1].replace(/^['"]|['"]$/g, ''));
      }
    }
  }
  return packages;
}

function parseWorkspaceCatalog(yamlText) {
  const lines = yamlText.split('\n');
  const catalog = new Map();
  let inCatalog = false;
  for (const line of lines) {
    if (/^catalog:\s*$/.test(line)) {
      inCatalog = true;
      continue;
    }
    if (inCatalog) {
      if (/^\S/.test(line)) break; // dedented, section over
      const match = line.match(/^\s*(['"]?)([^'":\s]+)\1:\s*(.+?)\s*$/);
      if (match) {
        catalog.set(match[2], match[3].replace(/^['"]|['"]$/g, ''));
      }
    }
  }
  return catalog;
}

function resolveWorkspacePackageJsonPaths(patterns) {
  const packageJsonPaths = new Set();
  for (const pattern of patterns) {
    const glob = pattern.includes('*')
      ? join(pattern, 'package.json')
      : join(pattern, 'package.json');
    for (const match of globSync(glob, {cwd: ROOT})) {
      packageJsonPaths.add(match);
    }
  }
  return [...packageJsonPaths].sort();
}

const workspaceYaml = readFileSync(WORKSPACE_FILE, 'utf8');
const packagePatterns = parseWorkspacePackages(workspaceYaml);
const catalog = parseWorkspaceCatalog(workspaceYaml);
const packageJsonPaths = resolveWorkspacePackageJsonPaths(packagePatterns);

const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'];

// dependencyName -> Map<versionSpecifier, Set<packageJsonPath>>
const usage = new Map();

for (const relativePath of packageJsonPaths) {
  const absolutePath = join(ROOT, relativePath);
  const pkg = JSON.parse(readFileSync(absolutePath, 'utf8'));

  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;

    for (const [name, version] of Object.entries(deps)) {
      if (version.startsWith('workspace:')) continue;

      if (!usage.has(name)) usage.set(name, new Map());
      const versionsForDep = usage.get(name);
      if (!versionsForDep.has(version)) versionsForDep.set(version, new Set());
      versionsForDep.get(version).add(relativePath);
    }
  }
}

const errors = [];

for (const [name, versionsForDep] of usage) {
  const consumerCount = [...versionsForDep.values()].reduce((sum, paths) => sum + paths.size, 0);
  if (consumerCount < 2) continue;
  if (ALLOWED_DRIFT.has(name)) continue;

  const nonCatalogVersions = [...versionsForDep.keys()].filter((v) => v !== 'catalog:');
  const isCatalogued = catalog.has(name);

  if (isCatalogued && nonCatalogVersions.length > 0) {
    for (const version of nonCatalogVersions) {
      for (const path of versionsForDep.get(version)) {
        errors.push(
          `"${name}" is catalogued (${catalog.get(name)}) but ${path} pins it literally as "${version}". Use "catalog:" instead.`
        );
      }
    }
    continue;
  }

  if (!isCatalogued) {
    if (nonCatalogVersions.length > 1) {
      const details = nonCatalogVersions
        .map((v) => `${v} (${[...versionsForDep.get(v)].join(', ')})`)
        .join(' vs. ');
      errors.push(
        `"${name}" is used by more than one workspace package with drifting versions and is not catalogued: ${details}. Add it to catalog: in pnpm-workspace.yaml, or add it to ALLOWED_DRIFT in scripts/ci/catalog-consistency.mjs with a rationale if the drift is intentional.`
      );
    } else if (nonCatalogVersions.length === 1) {
      const [version] = nonCatalogVersions;
      const paths = versionsForDep.get(version);
      errors.push(
        `"${name}" is used by ${paths.size} workspace packages at the same version (${version}) but is not catalogued: ${[...paths].join(', ')}. Add it to catalog: in pnpm-workspace.yaml and switch these manifests to "catalog:".`
      );
    }
  }
}

if (errors.length > 0) {
  console.error(
    `Found ${errors.length} catalog consistency issue(s) across ${packageJsonPaths.length} workspace manifests:\n`
  );
  for (const error of errors.sort()) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.info(
  `No catalog consistency issues found across ${packageJsonPaths.length} workspace manifests.`
);
