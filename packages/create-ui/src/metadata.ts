import {createRequire} from 'node:module';
import type {PackageJson} from './types.js';
import {getPackageManager} from './utils.js';

const COVEO_SCOPE = '@coveo/';

export interface ProjectMetadata {
  template: string;
  templateVersion: string;
  createdWith: string;
  createdOn: string;
  dependencies: Record<string, string>;
  node: string;
  packageManager: string;
}

export interface BuildProjectMetadataInput {
  template: string;
  templateVersion: string;
  dependencies: Record<string, string>;
}

export interface BuildProjectMetadataOverrides {
  now?: Date;
  cliVersion?: string;
  nodeVersion?: string;
  packageManager?: string;
}

export function getCliVersion(): string {
  const require = createRequire(import.meta.url);
  const {version} = require('../package.json') as {version: string};
  return version;
}

export function extractCoveoDependencies(
  pkg: Pick<PackageJson, 'dependencies'>
): Record<string, string> {
  const coveoDependencies: Record<string, string> = {};
  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    if (name.startsWith(COVEO_SCOPE)) {
      coveoDependencies[name] = version;
    }
  }
  return coveoDependencies;
}

function withoutLeadingV(version: string): string {
  return version.replace(/^v/, '');
}

export function buildProjectMetadata(
  input: BuildProjectMetadataInput,
  overrides: BuildProjectMetadataOverrides = {}
): ProjectMetadata {
  const now = overrides.now ?? new Date();
  const cliVersion = overrides.cliVersion ?? getCliVersion();
  const nodeVersion = overrides.nodeVersion ?? process.version;
  const packageManager = overrides.packageManager ?? getPackageManager();
  return {
    template: input.template,
    templateVersion: input.templateVersion,
    createdWith: `create-ui@${cliVersion}`,
    createdOn: now.toISOString(),
    dependencies: input.dependencies,
    node: withoutLeadingV(nodeVersion),
    packageManager,
  };
}
