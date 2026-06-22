/**
 * Resolves monorepo-only dependency protocols in a scaffolded sample's
 * package.json so it can be installed outside the workspace:
 *   - `catalog:` / `catalog:<name>` -> a concrete version from the catalog
 *     block(s) of `pnpm-workspace.yaml`
 *   - `workspace:` (any form) for a monorepo package -> a caret range built
 *     from that package's own version in the tarball
 *
 * Unlike `flatten-catalog.mjs` (which runs `pnpm list` inside the monorepo),
 * this reads versions from the downloaded tarball, so it works on a user's
 * machine. Throws if any protocol cannot be resolved (never emits a broken
 * package.json).
 */

import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {parse as parseYaml} from 'yaml';
import type {PackageJson} from './types.js';

export interface ResolutionContext {
  /** Default catalog: dependency name -> version. */
  catalog: Record<string, string>;
  /** Named catalogs: catalogName -> (dependency name -> version). */
  catalogs: Record<string, Record<string, string>>;
  /** Monorepo package name -> version (for workspace: resolution). */
  workspaceVersions: Record<string, string>;
}

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

/** Adds a caret to a bare version; leaves existing ranges untouched. */
function toCaretRange(version: string): string {
  return /^\d/.test(version) ? `^${version}` : version;
}

/** Parses the catalog and catalogs blocks from pnpm-workspace.yaml content. */
export function parseCatalogs(workspaceYaml: string): {
  catalog: Record<string, string>;
  catalogs: Record<string, Record<string, string>>;
} {
  const doc = (parseYaml(workspaceYaml) ?? {}) as {
    catalog?: Record<string, string>;
    catalogs?: Record<string, Record<string, string>>;
  };
  return {
    catalog: doc.catalog ?? {},
    catalogs: doc.catalogs ?? {},
  };
}

function resolveCatalogReference(
  name: string,
  spec: string,
  ctx: ResolutionContext
): string {
  // `catalog:` uses the default catalog; `catalog:foo` uses a named catalog.
  const named = spec.slice('catalog:'.length).trim();
  const table = named ? ctx.catalogs[named] : ctx.catalog;
  const version = table?.[name];
  if (!version) {
    throw new Error(
      `Cannot resolve "${name}": "${spec}" not found in ${
        named ? `catalog "${named}"` : 'the default catalog'
      } of pnpm-workspace.yaml.`
    );
  }
  return toCaretRange(version);
}

function resolveWorkspaceReference(
  name: string,
  ctx: ResolutionContext
): string {
  const version = ctx.workspaceVersions[name];
  if (!version) {
    throw new Error(
      `Cannot resolve "${name}": workspace dependency has no known published version in the monorepo.`
    );
  }
  return toCaretRange(version);
}

/** Pure: resolves all protocol references in a single dependency map. */
export function resolveDependencyMap(
  deps: Record<string, string>,
  ctx: ResolutionContext
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [name, spec] of Object.entries(deps)) {
    if (spec.startsWith('catalog:')) {
      resolved[name] = resolveCatalogReference(name, spec, ctx);
    } else if (spec.startsWith('workspace:')) {
      resolved[name] = resolveWorkspaceReference(name, ctx);
    } else {
      resolved[name] = spec;
    }
  }
  return resolved;
}

/** Pure: returns a new package.json with all protocol references resolved. */
export function resolvePackageJson(
  pkg: PackageJson,
  ctx: ResolutionContext
): PackageJson {
  const next: PackageJson = {...pkg};
  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg[field];
    if (deps) {
      next[field] = resolveDependencyMap(deps, ctx);
    }
  }
  return next;
}

/** Reads every `packages/<dir>/package.json`, indexed by package name. */
async function readWorkspaceVersions(
  treeRoot: string
): Promise<Record<string, string>> {
  const packagesDir = join(treeRoot, 'packages');
  const versions: Record<string, string> = {};
  let entries: string[] = [];
  try {
    entries = await readdir(packagesDir);
  } catch {
    return versions;
  }
  for (const dir of entries) {
    try {
      const raw = await readFile(
        join(packagesDir, dir, 'package.json'),
        'utf8'
      );
      const pkg = JSON.parse(raw) as PackageJson;
      if (pkg.name && pkg.version) {
        versions[pkg.name] = pkg.version;
      }
    } catch {
      // Not every directory has a package.json; skip it.
    }
  }
  return versions;
}

/**
 * Resolves the sample's package.json in place using the catalog and package
 * versions from the extracted tarball tree (`treeRoot` contains
 * pnpm-workspace.yaml and the packages directory).
 */
export async function resolveSampleDependencies(options: {
  sampleDir: string;
  treeRoot: string;
}): Promise<void> {
  const {sampleDir, treeRoot} = options;

  const workspaceYaml = await readFile(
    join(treeRoot, 'pnpm-workspace.yaml'),
    'utf8'
  );
  const {catalog, catalogs} = parseCatalogs(workspaceYaml);
  const workspaceVersions = await readWorkspaceVersions(treeRoot);

  const pkgPath = join(sampleDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as PackageJson;
  const resolved = resolvePackageJson(pkg, {
    catalog,
    catalogs,
    workspaceVersions,
  });

  await writeFile(pkgPath, `${JSON.stringify(resolved, null, 2)}\n`);
}
