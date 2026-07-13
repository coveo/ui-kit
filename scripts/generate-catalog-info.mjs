/**
 * Generates Backstage catalog-info.yaml files from package.json + catalog-info.config.yaml.
 *
 * For each package that contains a `catalog-info.config.yaml`, this script
 * produces a `catalog-info.yaml` file in the package directory.
 *
 * It also generates:
 * - catalog-info.ui-kit.yaml (the System entity, from root catalog-info.ui-kit.config.yaml)
 * - catalog-info.yaml (the Location entity that references all component files)
 *
 * Usage:
 *   node scripts/generate-catalog-info.mjs
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = resolve(fileURLToPath(import.meta.url), '..', '..');
const packagesDir = resolve(rootDir, 'packages');

/**
 * Parses a flat YAML file (key: value pairs only, no nesting).
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function parseSimpleYaml(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    result[key] = value;
  }
  return result;
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
 * @param {object} manifest - parsed package.json
 * @param {Record<string, string>} config - parsed catalog-info.config.yaml
 * @param {{dependsOn: string[]}} relations
 * @returns {string}
 */
function generateComponentYaml(manifest, config, relations) {
  const componentName = getComponentName(manifest.name);

  const doc = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: componentName,
      title: manifest.name,
      description: manifest.description,
    },
    spec: {
      type: config.type || 'library',
      lifecycle: config.lifecycle || 'production',
      owner: config.owner || 'group:default/dxui',
      system: 'ui-kit',
    },
  };

  if (relations.dependsOn.length) {
    doc.spec.dependsOn = relations.dependsOn
      .map((dep) => `component:default/${dep}`)
      .toSorted();
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
    },
    spec: {
      type: 'url',
      targets: targetPaths,
    },
  };

  return toYaml(doc);
}

/**
 * Generates the System catalog-info.ui-kit.yaml.
 * @param {object} rootManifest - parsed root package.json
 * @param {Record<string, string>} config - parsed catalog-info.ui-kit.config.yaml
 * @returns {string}
 */
function generateSystemYaml(rootManifest, config) {
  const doc = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'System',
    metadata: {
      name: rootManifest.name,
      title: rootManifest.name
        .split('-')
        .map((w) =>
          w.length <= 2
            ? w.toUpperCase()
            : w.charAt(0).toUpperCase() + w.slice(1)
        )
        .join(' '),
      description: rootManifest.description,
    },
    spec: {
      owner: config.owner || 'group:default/dxui',
    },
  };

  return toYaml(doc);
}

/**
 * Extracts workspace dependency names from dependencies + peerDependencies.
 * @param {object} manifest
 * @param {Set<string>} catalogComponents
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

function main() {
  const packageDirs = readdirSync(packagesDir).filter((dir) => {
    const fullPath = resolve(packagesDir, dir);
    return (
      statSync(fullPath).isDirectory() &&
      existsSync(resolve(fullPath, 'package.json'))
    );
  });

  /** @type {Map<string, {manifest: object, config: Record<string, string>}>} */
  const catalogPackages = new Map();

  for (const dir of packageDirs) {
    const configPath = resolve(packagesDir, dir, 'catalog-info.config.yaml');
    if (!existsSync(configPath)) continue;

    const manifestPath = resolve(packagesDir, dir, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const config = parseSimpleYaml(configPath);
    catalogPackages.set(dir, {manifest, config});
  }

  const catalogComponents = new Set(
    [...catalogPackages.values()].map((p) => getComponentName(p.manifest.name))
  );

  /** @type {Map<string, string[]>} */
  const dependsOnMap = new Map();

  for (const [, {manifest}] of catalogPackages) {
    const componentName = getComponentName(manifest.name);
    const dependsOn = getWorkspaceDependsOn(manifest, catalogComponents);
    dependsOnMap.set(componentName, dependsOn);
  }

  const targets = ['./catalog-info.ui-kit.yaml'];
  let generated = 0;

  for (const [dir, {manifest, config}] of catalogPackages) {
    const componentName = getComponentName(manifest.name);
    const relations = {
      dependsOn: dependsOnMap.get(componentName) || [],
    };

    const yaml = generateComponentYaml(manifest, config, relations);
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
  const rootConfigPath = resolve(rootDir, 'catalog-info.ui-kit.config.yaml');
  const rootConfig = existsSync(rootConfigPath)
    ? parseSimpleYaml(rootConfigPath)
    : {};

  const systemYaml = generateSystemYaml(rootManifest, rootConfig);
  writeFileSync(resolve(rootDir, 'catalog-info.ui-kit.yaml'), systemYaml);
  console.log('Generated: ./catalog-info.ui-kit.yaml');

  const locationYaml = generateLocationYaml(targets.sort());
  writeFileSync(resolve(rootDir, 'catalog-info.yaml'), locationYaml);
  console.log('Generated: ./catalog-info.yaml');

  console.log(`\nDone. Generated ${generated} component files + 2 root files.`);
}

main();
