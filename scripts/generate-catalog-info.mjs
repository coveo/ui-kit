/**
 * Generates Backstage catalog-info.yaml files from package metadata.
 *
 * For each package that contains a catalog-info.config.json file,
 * this script combines that catalog metadata with package.json data
 * and produces a catalog-info.yaml file in the package directory.
 *
 * It also generates:
 * - catalog-info.ui-kit.yaml (the System entity for the monorepo)
 * - catalog-info.yaml (the Location entity that references all component files)
 *
 * Usage:
 *   node scripts/generate-catalog-info.mjs
 */

import {readFileSync, writeFileSync, readdirSync, statSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = resolve(fileURLToPath(import.meta.url), '..', '..');
const packagesDir = resolve(rootDir, 'packages');
const catalogInfoConfigFileName = 'catalog-info.config.json';

/**
 * @typedef {object} CatalogInfo
 * @property {string} [lifecycle]
 * @property {string} [owner]
 * @property {string} [type]
 */

/**
 * @typedef {object} PackageManifest
 * @property {string} name
 * @property {string} [description]
 * @property {Record<string, string>} [dependencies]
 * @property {{url?: string}} [repository]
 */

function getProjectSlug() {
  return 'coveo/ui-kit';
}

/**
 * Strips the npm scope from a package name.
 * @param {string} name
 * @returns {string}
 */
function getComponentName(name) {
  return name.replace(/^@[^/]+\//, '');
}

/**
 * Formats a scalar YAML value with appropriate quoting.
 * @param {string} value
 * @returns {string}
 */
function formatScalar(value) {
  if (value.startsWith('@')) {
    return `'${value}'`;
  }
  return value;
}

/**
 * Serializes a YAML document from a structured object.
 * Minimal YAML writer that handles the catalog-info structure.
 * @param {object} doc
 * @returns {string}
 */
function toYaml(doc) {
  const lines = [];

  function write(obj, indent = 0) {
    const prefix = ' '.repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) {
        continue;
      }
      if (Array.isArray(value)) {
        lines.push(`${prefix}${key}:`);
        for (const item of value) {
          lines.push(`${prefix}  - ${item}`);
        }
      } else if (typeof value === 'object') {
        lines.push(`${prefix}${key}:`);
        write(value, indent + 2);
      } else {
        const strValue = String(value);
        const quoted = formatScalar(strValue);
        lines.push(`${prefix}${key}: ${quoted}`);
      }
    }
  }

  write(doc);
  return lines.join('\n') + '\n';
}

/**
 * Generates a catalog-info.yaml for a single package.
 * @param {PackageManifest} manifest
 * @param {CatalogInfo} catalogInfo
 * @param {{dependsOn: string[], dependencyOf: string[]}} relations
 * @returns {string}
 */
function generateComponentYaml(manifest, catalogInfo, relations) {
  const componentName = getComponentName(manifest.name);

  const doc = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: componentName,
      title: manifest.name,
      description: manifest.description,
      annotations: {
        'github.com/project-slug': getProjectSlug(),
      },
    },
    spec: {
      type: catalogInfo.type || 'library',
      lifecycle: catalogInfo.lifecycle || 'production',
      owner: catalogInfo.owner || 'dxui',
      system: 'ui-kit',
    },
  };

  if (relations.dependsOn.length) {
    doc.spec.dependsOn = [...relations.dependsOn].sort();
  }
  if (relations.dependencyOf.length) {
    doc.spec.dependencyOf = [...relations.dependencyOf].sort();
  }

  return toYaml(doc);
}

/**
 * Generates the root Location catalog-info.yaml.
 * @param {string[]} targetPaths
 * @returns {string}
 */
function generateLocationYaml(targetPaths) {
  const doc = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Location',
    metadata: {
      name: 'ui-kit-catalog',
      annotations: {
        'github.com/project-slug': getProjectSlug(),
      },
    },
    spec: {
      type: 'url',
      targets: targetPaths,
    },
  };

  return toYaml(doc);
}

/**
 * Generates the System catalog-info.ui-kit.yaml from the root package.json
 * and catalog-info.config.json.
 * @param {PackageManifest} rootManifest
 * @param {CatalogInfo} catalogInfo
 * @returns {string}
 */
function generateSystemYaml(rootManifest, catalogInfo) {
  const doc = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'System',
    metadata: {
      name: rootManifest.name,
      title: rootManifest.name,
      description: rootManifest.description,
      annotations: {
        'github.com/project-slug': getProjectSlug(),
      },
    },
    spec: {
      owner: catalogInfo.owner || 'dxui',
    },
  };

  return toYaml(doc);
}

/**
 * Extracts workspace dependency names (stripped of scope) from a manifest's dependencies and peerDependencies.
 * Only considers `dependencies` and `peerDependencies`, not `devDependencies`.
 * @param {PackageManifest} manifest
 * @param {Set<string>} catalogComponents - set of component names that have catalog metadata
 * @returns {string[]}
 */
function getWorkspaceDependsOn(manifest, catalogComponents) {
  const deps = {...manifest.dependencies, ...manifest.peerDependencies};
  const result = [];
  for (const [name, version] of Object.entries(deps)) {
    if (version.startsWith('workspace:')) {
      const componentName = getComponentName(name);
      if (catalogComponents.has(componentName)) {
        result.push(componentName);
      }
    }
  }
  return result;
}

/**
 * Reads catalog metadata from catalog-info.config.json when present.
 * @param {string} directory
 * @returns {CatalogInfo | undefined}
 */
function readCatalogInfo(directory) {
  const catalogInfoPath = resolve(directory, catalogInfoConfigFileName);
  const stats = statSync(catalogInfoPath, {throwIfNoEntry: false});
  if (!stats) {
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(catalogInfoPath, 'utf-8'));
  } catch (error) {
    const reason = error instanceof SyntaxError ? 'parse' : 'read';
    throw new Error(
      `Failed to ${reason} ${relative(rootDir, catalogInfoPath)}: ${error.message}`,
      {cause: error}
    );
  }
}

function main() {
  const packageDirs = readdirSync(packagesDir).filter((dir) => {
    const fullPath = resolve(packagesDir, dir);
    return (
      statSync(fullPath).isDirectory() &&
      statSync(resolve(fullPath, 'package.json'), {throwIfNoEntry: false})
    );
  });

  /** @type {Map<string, {manifest: PackageManifest, catalogInfo: CatalogInfo}>} */
  const catalogPackages = new Map();

  for (const dir of packageDirs) {
    const packageDir = resolve(packagesDir, dir);
    const manifestPath = resolve(packageDir, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const catalogInfo = readCatalogInfo(packageDir);
    if (catalogInfo) {
      catalogPackages.set(dir, {manifest, catalogInfo});
    }
  }

  const catalogComponents = new Set(
    [...catalogPackages.values()].map(({manifest}) =>
      getComponentName(manifest.name)
    )
  );

  /** @type {Map<string, string[]>} dependencyOf map: component -> list of components that depend on it */
  const dependencyOfMap = new Map();

  /** @type {Map<string, string[]>} dependsOn map: component -> list of workspace deps */
  const dependsOnMap = new Map();

  for (const [, {manifest}] of catalogPackages) {
    const componentName = getComponentName(manifest.name);
    const dependsOn = getWorkspaceDependsOn(manifest, catalogComponents);
    dependsOnMap.set(componentName, dependsOn);

    for (const dep of dependsOn) {
      if (!dependencyOfMap.has(dep)) {
        dependencyOfMap.set(dep, []);
      }
      dependencyOfMap.get(dep).push(componentName);
    }
  }

  const targets = ['./catalog-info.ui-kit.yaml'];
  let generated = 0;

  for (const [dir, {manifest, catalogInfo}] of catalogPackages) {
    const componentName = getComponentName(manifest.name);
    const relations = {
      dependsOn: dependsOnMap.get(componentName) || [],
      dependencyOf: dependencyOfMap.get(componentName) || [],
    };

    const yaml = generateComponentYaml(manifest, catalogInfo, relations);
    const outputPath = resolve(packagesDir, dir, 'catalog-info.yaml');
    writeFileSync(outputPath, yaml);

    const relativePath = `./${relative(rootDir, outputPath)}`;
    targets.push(relativePath);
    generated++;

    console.log(`Generated: ${relativePath}`);
  }

  const rootManifest = JSON.parse(
    readFileSync(resolve(rootDir, 'package.json'), 'utf-8')
  );

  const systemYaml = generateSystemYaml(
    rootManifest,
    readCatalogInfo(rootDir) || {}
  );
  writeFileSync(resolve(rootDir, 'catalog-info.ui-kit.yaml'), systemYaml);
  console.log('Generated: ./catalog-info.ui-kit.yaml');

  const locationYaml = generateLocationYaml(targets.sort());
  writeFileSync(resolve(rootDir, 'catalog-info.yaml'), locationYaml);
  console.log('Generated: ./catalog-info.yaml');

  console.log(`\nDone. Generated ${generated} component files + 2 root files.`);
}

main();
