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

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  getAllPackageDirs,
  getPackageManifestFromPackagePath,
  getPackagePathFromPackageDir,
  workspacesRoot,
} from './packages.mjs';

import {parse as parseYaml} from 'yaml';

/** @type {string[]} */
const DEP_TYPES = ['dependencies', 'devDependencies', 'peerDependencies'];

/**
 * @typedef DepOccurrence
 * @property {string} packageDir - Relative path under `packages/`.
 * @property {string} version - Raw version string from the manifest.
 * @property {string} depType - One of `dependencies`, `devDependencies`, `peerDependencies`.
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
 * Collects all hardcoded dependency occurrences across the monorepo.
 *
 * @returns {Map<string, DepOccurrence[]>}
 */
function collectDependencies() {
  /** @type {Map<string, DepOccurrence[]>} */
  const depMap = new Map();
  const dirs = getAllPackageDirs();

  for (const dir of dirs) {
    const fullPath = getPackagePathFromPackageDir(dir);
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
        depMap.get(name).push({packageDir: dir, version, depType});
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
 * Converts a list of entries into the JSON-friendly array format,
 * split by catalog membership.
 *
 * @param {Array<{name: string, occurrences: DepOccurrence[]}>} entries
 * @param {Record<string, string>} catalog
 * @returns {{notInCatalog: Array<{name: string, versions: Record<string, Array<{package: string, depType: string}>>}>, inCatalog: Array<{name: string, versions: Record<string, Array<{package: string, depType: string}>>}>}}
 */
function buildCategorySection(entries, catalog) {
  const notInCatalog = entries.filter((e) => !(e.name in catalog));
  const inCatalog = entries.filter((e) => e.name in catalog);

  return {
    notInCatalog: notInCatalog.map(buildEntryObject),
    inCatalog: inCatalog.map(buildEntryObject),
  };
}

/**
 * Converts a single entry into the JSON-friendly object format.
 *
 * @param {{name: string, occurrences: DepOccurrence[]}} entry
 * @returns {{name: string, versions: Record<string, Array<{package: string, depType: string}>>}}
 */
function buildEntryObject({name, occurrences}) {
  /** @type {Record<string, Array<{package: string, depType: string}>>} */
  const versions = {};

  for (const occ of occurrences) {
    if (!versions[occ.version]) {
      versions[occ.version] = [];
    }
    versions[occ.version].push({package: occ.packageDir, depType: occ.depType});
  }

  return {name, versions};
}

/**
 * Main entry point. Collects dependencies, classifies divergence, and
 * outputs a structured JSON report to stdout.
 */
function main() {
  const catalog = readCatalog();
  const depMap = collectDependencies();

  /** @type {Array<{name: string, occurrences: DepOccurrence[]}>} */
  const differentMajors = [];
  /** @type {Array<{name: string, occurrences: DepOccurrence[]}>} */
  const differentMinors = [];
  /** @type {Array<{name: string, occurrences: DepOccurrence[]}>} */
  const differentPatches = [];
  /** @type {Array<{name: string, occurrences: DepOccurrence[]}>} */
  const exactSame = [];

  for (const [name, occurrences] of depMap) {
    if (occurrences.length < 2) continue;

    const category = classifyDivergence(occurrences);
    const entry = {name, occurrences};

    switch (category) {
      case 'different-majors':
        differentMajors.push(entry);
        break;
      case 'different-minors':
        differentMinors.push(entry);
        break;
      case 'different-patches':
        differentPatches.push(entry);
        break;
      case 'exact-same':
        exactSame.push(entry);
        break;
    }
  }

  const sortByName = (a, b) => a.name.localeCompare(b.name);
  differentMajors.sort(sortByName);
  differentMinors.sort(sortByName);
  differentPatches.sort(sortByName);
  exactSame.sort(sortByName);

  const total =
    differentMajors.length + differentMinors.length + differentPatches.length + exactSame.length;

  const report = {
    summary: {
      total,
      differentMajors: differentMajors.length,
      differentMinors: differentMinors.length,
      differentPatches: differentPatches.length,
      exactSame: exactSame.length,
    },
    categories: {
      differentMajors: buildCategorySection(differentMajors, catalog),
      differentMinors: buildCategorySection(differentMinors, catalog),
      differentPatches: buildCategorySection(differentPatches, catalog),
      exactSame: buildCategorySection(exactSame, catalog),
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
