import {copyFileSync, cpSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse as parseYaml} from 'yaml';

/**
 * Detects the indentation used in a string.
 * @param {string} str - The string to analyze
 * @returns {{indent: string, amount: number, type: 'tab' | 'space' | undefined}} The detected indentation
 */
function detectIndent(str) {
  const tabMatch = str.match(/^(\t+)/m);
  if (tabMatch) {
    return {
      indent: '\t',
      amount: 1,
      type: 'tab',
    };
  }

  const spaceMatch = str.match(/^( +)/m);
  if (spaceMatch) {
    const amount = spaceMatch[1].length;
    return {
      indent: ' '.repeat(amount),
      amount,
      type: 'space',
    };
  }

  return {
    indent: '',
    amount: 0,
    type: undefined,
  };
}

/**
 * Resolves workspace:* and catalog: version placeholders to actual versions.
 * @param {Record<string, string>} deps - Dependencies object with potential placeholders
 * @param {Record<string, string>} catalog - Catalog mapping from pnpm-workspace.yaml
 * @param {Record<string, string>} workspaceVersions - Map of package names to their versions
 * @returns {Record<string, string>} Dependencies with resolved versions
 */
function resolveDependencyVersions(deps, catalog, workspaceVersions) {
  const resolved = {};
  for (const [pkg, version] of Object.entries(deps)) {
    if (version === 'workspace:*' || version.startsWith('workspace:')) {
      const resolvedVersion = workspaceVersions[pkg];
      if (!resolvedVersion) {
        throw new Error(
          `Could not resolve workspace version for ${pkg}. Make sure the package exists in the monorepo.`
        );
      }
      resolved[pkg] = `^${resolvedVersion}`;
    } else if (version === 'catalog:' || version.startsWith('catalog:')) {
      const catalogVersion = catalog[pkg];
      if (!catalogVersion) {
        throw new Error(
          `Could not resolve catalog version for ${pkg}. Make sure it exists in pnpm-workspace.yaml catalog.`
        );
      }
      resolved[pkg] = `^${catalogVersion}`;
    } else {
      resolved[pkg] = version;
    }
  }
  return resolved;
}

/**
 * Gets the version from a package.json file.
 * @param {string} packagePath - Path to the package directory
 * @returns {string} The version from package.json
 */
function getPackageVersion(packagePath) {
  const pkgJsonPath = join(packagePath, 'package.json');
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  return pkgJson.version;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagesRoot = resolve(__dirname, '..', '..');
const repoRoot = resolve(packagesRoot, '..');

const atomicTemplatePath = resolve(packagesRoot, 'create-atomic-template');
const bundledTemplatePath = resolve(__dirname, '..', 'template');

// Load pnpm-workspace.yaml to get catalog versions
const workspaceYamlPath = join(repoRoot, 'pnpm-workspace.yaml');
const workspaceYaml = parseYaml(readFileSync(workspaceYamlPath, 'utf-8'));
const catalog = workspaceYaml.catalog || {};

// Build workspace versions map for packages that might use workspace:*
const workspaceVersions = {
  '@coveo/atomic': getPackageVersion(join(packagesRoot, 'atomic')),
  '@coveo/headless': getPackageVersion(join(packagesRoot, 'headless')),
  '@coveo/create-atomic-rollup-plugin': getPackageVersion(
    join(packagesRoot, 'create-atomic-rollup-plugin')
  ),
};

cpSync(atomicTemplatePath, bundledTemplatePath, {recursive: true});
copyFileSync(
  join(__dirname, '!.eslintrc'),
  join(bundledTemplatePath, '.eslintrc')
);

const packageJson = readFileSync(
  join(bundledTemplatePath, 'package.json'),
  'utf-8'
);

const packageTemplate = readFileSync(
  resolve(__dirname, 'packageTemplate.json'),
  'utf-8'
);

const pkgIndent = detectIndent(packageTemplate).indent || '\t';
const finalPackageJsonTemplate = JSON.parse(packageTemplate);
const packageJsonObject = JSON.parse(packageJson);

// Resolve workspace:* and catalog: placeholders to actual versions
finalPackageJsonTemplate.dependencies = resolveDependencyVersions(
  packageJsonObject.dependencies || {},
  catalog,
  workspaceVersions
);
finalPackageJsonTemplate.devDependencies = resolveDependencyVersions(
  packageJsonObject.devDependencies || {},
  catalog,
  workspaceVersions
);

writeFileSync(
  resolve(__dirname, '..', 'template', 'package.json.hbs'),
  JSON.stringify(finalPackageJsonTemplate, undefined, pkgIndent)
);
