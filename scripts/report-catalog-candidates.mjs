/**
 * Reports third-party dependencies that appear (with hardcoded versions)
 * in more than one package's `package.json`, grouped by version divergence
 * and catalog membership.
 *
 * Outputs structured JSON to stdout.
 *
 * Usage:
 *   node scripts/report-catalog-candidates.mjs
 */

import {existsSync, readFileSync, globSync} from 'node:fs';
import {resolve} from 'node:path';
import {getPackageManifestFromPackagePath, workspacesRoot} from './packages.mjs';

import {parse as parseYaml} from 'yaml';

/** @type {string[]} */
const DEP_TYPES = ['dependencies', 'devDependencies', 'peerDependencies'];

/**
 * @typedef DepOccurrence
 * @property {string} package - Relative path from workspace root (e.g., `packages/atomic`, `samples/headless/search`, `.`).
 * @property {string} version - Raw version string from the manifest.
 */

/**
 * @typedef ParsedVersion
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 */

/**
 * Strips a leading semver range prefix from a version string.
 *
 * @param {string} version
 * @returns {string}
 */
function stripRangePrefix(version) {
  return version.replace(/^[>=<~^]+/, '');
}

/**
 * Attempts to parse a version string into major, minor, and patch numbers.
 * Returns `null` if the version cannot be parsed.
 *
 * @param {string} version
 * @returns {ParsedVersion | null}
 */
function parseSemver(version) {
  const stripped = stripRangePrefix(version);
  const match = stripped.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/**
 * Reads the catalog from `pnpm-workspace.yaml`.
 *
 * @returns {Record<string, string>}
 */
function readCatalog() {
  const workspaceYamlPath = resolve(workspacesRoot, 'pnpm-workspace.yaml');
  const content = readFileSync(workspaceYamlPath, 'utf-8');
  const parsed = parseYaml(content);
  return parsed?.catalog ?? {};
}

/**
 * Resolves all workspace package directories from `pnpm-workspace.yaml`,
 * including the root.
 *
 * @returns {Array<{label: string, fullPath: string}>}
 */
function getAllWorkspacePackagePaths() {
  const workspaceYamlPath = resolve(workspacesRoot, 'pnpm-workspace.yaml');
  const content = readFileSync(workspaceYamlPath, 'utf-8');
  const parsed = parseYaml(content);
  const patterns = parsed.packages ?? [];

  /** @type {Array<{label: string, fullPath: string}>} */
  const results = [];

  for (const pattern of patterns) {
    const matches = globSync(pattern, {cwd: workspacesRoot});
    for (const match of matches) {
      const fullPath = resolve(workspacesRoot, match);
      if (existsSync(resolve(fullPath, 'package.json'))) {
        results.push({label: match, fullPath});
      }
    }
  }

  results.push({label: '.', fullPath: workspacesRoot});

  return results;
}

/**
 * Collects all hardcoded dependency occurrences across the monorepo.
 *
 * @returns {Map<string, DepOccurrence[]>}
 */
function collectDependencies() {
  /** @type {Map<string, DepOccurrence[]>} */
  const depMap = new Map();
  const packages = getAllWorkspacePackagePaths();

  for (const {label, fullPath} of packages) {
    const manifest = getPackageManifestFromPackagePath(fullPath);

    for (const depType of DEP_TYPES) {
      const deps = /** @type {Record<string, string> | undefined} */ (manifest[depType]);
      if (!deps) continue;

      for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith('workspace:') || version.startsWith('catalog:')) {
          continue;
        }

        if (!depMap.has(name)) {
          depMap.set(name, []);
        }
        depMap.get(name).push({package: label, version});
      }
    }
  }

  return depMap;
}

/**
 * Determines the divergence category for a set of occurrences.
 *
 * @param {DepOccurrence[]} occurrences
 * @returns {'different-majors' | 'different-minors' | 'different-patches' | 'exact-same'}
 */
function classifyDivergence(occurrences) {
  const versions = [...new Set(occurrences.map((o) => o.version))];

  if (versions.length === 1) {
    return 'exact-same';
  }

  const parsed = versions.map(parseSemver);

  if (parsed.some((p) => p === null)) {
    return 'different-majors';
  }

  const majors = new Set(parsed.map((p) => p.major));
  if (majors.size > 1) {
    return 'different-majors';
  }

  const minors = new Set(parsed.map((p) => p.minor));
  if (minors.size > 1) {
    return 'different-minors';
  }

  const patches = new Set(parsed.map((p) => p.patch));
  return patches.size > 1 ? 'different-patches' : 'exact-same';
}

/**
 * Main entry point. Collects dependencies, classifies divergence, and
 * outputs a structured JSON report to stdout.
 */
function main() {
  const catalog = readCatalog();
  const depMap = collectDependencies();

  const counts = {
    'different-majors': 0,
    'different-minors': 0,
    'different-patches': 0,
    'exact-same': 0,
    'bypasses-catalog': 0,
  };

  /** @type {Record<string, object>} */
  const entries = {};

  for (const [name, occurrences] of depMap) {
    if (occurrences.length < 2 && !(name in catalog)) continue;

    const divergence = classifyDivergence(occurrences);

    const issues = [divergence];
    if (name in catalog) {
      issues.push('bypasses-catalog');
    }

    const entry = {
      _catalog: catalog[name] ?? null,
      _issues: issues,
    };

    for (const occ of occurrences) {
      entry[occ.package] = occ.version;
    }

    entries[name] = entry;

    counts[divergence]++;
    if (issues.includes('bypasses-catalog')) {
      counts['bypasses-catalog']++;
    }
  }

  const sortedKeys = Object.keys(entries).sort();
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const report = {
    _summary: {
      total,
      ...counts,
    },
  };

  for (const key of sortedKeys) {
    report[key] = entries[key];
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
