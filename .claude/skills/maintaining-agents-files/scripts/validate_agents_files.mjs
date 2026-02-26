#!/usr/bin/env node
/**
 * AGENTS.md Fact Gatherer
 *
 * For each AGENTS.md in the monorepo, collects the ground-truth data
 * an agent needs to verify it: package.json scripts, dependency versions,
 * top-level directory listing, and the AGENTS.md content itself.
 *
 * Usage:
 *     node .claude/skills/maintaining-agents-files/scripts/validate_agents_files.mjs [--json]
 */

import {execSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {parseArgs} from 'node:util';

const {values: flags} = parseArgs({
  options: {
    json: {type: 'boolean', default: false},
    help: {type: 'boolean', short: 'h', default: false},
  },
  strict: false,
});

if (flags.help) {
  console.log(`
AGENTS.md Fact Gatherer

Collects ground-truth data for each AGENTS.md in the monorepo so an AI
agent can compare it against what's documented.

Usage:
  node validate_agents_files.mjs [options]

Options:
  --json          Output as JSON (default: human-readable)
  --help, -h      Show this help message
`);
  process.exit(0);
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const ROOT = findMonorepoRoot(process.cwd());

function findMonorepoRoot(startDir) {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    if (
      existsSync(join(dir, 'pnpm-workspace.yaml')) &&
      existsSync(join(dir, 'AGENTS.md'))
    ) {
      return dir;
    }
    dir = dirname(dir);
  }
  console.error(
    'Could not find monorepo root (looking for pnpm-workspace.yaml + AGENTS.md)'
  );
  process.exit(1);
}

function loadPackageJson(dir) {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    return null;
  }
}

const IGNORED = new Set([
  'node_modules',
  'dist',
  'www',
  'coverage',
  '.git',
  '.turbo',
  '.cache',
  '.temp',
  '__snapshots__',
  'playwright-report',
  'dist-storybook',
  'docs',
]);

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, {withFileTypes: true})
    .filter((d) => d.isDirectory() && !IGNORED.has(d.name))
    .map((d) => d.name)
    .sort();
}

/**
 * Runs `pnpm list -r --depth=0 --json` once and returns a Map<absolutePath, resolvedDeps>
 * where resolvedDeps is { [packageName]: resolvedVersion }.
 */
function loadResolvedDeps(root) {
  const map = new Map();
  try {
    const raw = execSync('pnpm list -r --depth=0 --json', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const packages = JSON.parse(raw);
    for (const pkg of packages) {
      const deps = {};
      for (const section of ['dependencies', 'devDependencies']) {
        if (!pkg[section]) continue;
        for (const [name, info] of Object.entries(pkg[section])) {
          deps[name] = info.version;
        }
      }
      map.set(pkg.path, deps);
    }
  } catch {
    // pnpm not available or command failed — fall back to empty
  }
  return map;
}

// -------------------------------------------------------------------
// Discovery & data gathering
// -------------------------------------------------------------------

function discoverAgentsFiles(root) {
  const files = [];
  const rootAgents = join(root, 'AGENTS.md');
  if (existsSync(rootAgents)) files.push(rootAgents);

  const packagesDir = join(root, 'packages');
  if (existsSync(packagesDir)) {
    for (const pkg of readdirSync(packagesDir).sort()) {
      const agentsPath = join(packagesDir, pkg, 'AGENTS.md');
      if (existsSync(agentsPath)) files.push(agentsPath);
    }
  }
  return files;
}

function gatherFacts(agentsFilePath, resolvedDeps) {
  const dir = dirname(agentsFilePath);
  const relPath = relative(ROOT, agentsFilePath);
  const isRoot = dir === ROOT;
  const content = readFileSync(agentsFilePath, 'utf8');
  const packageJson = loadPackageJson(dir);

  const facts = {
    file: relPath,
    lineCount: content.split('\n').length,
    isRoot,
    agentsMdContent: content,
  };

  // Scripts from package.json
  facts.scripts = packageJson?.scripts
    ? Object.keys(packageJson.scripts).sort()
    : [];

  // Dependencies with resolved versions (via pnpm list)
  facts.dependencies = resolvedDeps.get(dir) ?? {};

  // Top-level directories
  facts.directories = listDirs(dir);

  // For root: also list packages/*
  if (isRoot) {
    const packagesDir = join(dir, 'packages');
    facts.packages = listDirs(packagesDir);
  }

  // Engine constraints (node, pnpm versions)
  if (packageJson?.engines) {
    facts.engines = packageJson.engines;
  }
  if (packageJson?.packageManager) {
    facts.packageManager = packageJson.packageManager;
  }

  return facts;
}

// -------------------------------------------------------------------
// Main
// -------------------------------------------------------------------

function main() {
  const agentsFiles = discoverAgentsFiles(ROOT);

  if (agentsFiles.length === 0) {
    console.error('No AGENTS.md files found.');
    process.exit(1);
  }

  const resolvedDeps = loadResolvedDeps(ROOT);
  const results = agentsFiles.map((f) => gatherFacts(f, resolvedDeps));

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const facts of results) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(
      `  ${facts.file} (${facts.lineCount} lines, ${facts.isRoot ? 'root' : 'package'})`
    );
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    console.log('📦 package.json scripts:');
    if (facts.scripts.length > 0) {
      for (const s of facts.scripts) {
        console.log(`   ${s}`);
      }
    } else {
      console.log('   (none)');
    }

    console.log('\n📂 Directories on disk:');
    for (const d of facts.directories) {
      console.log(`   ${d}/`);
    }

    if (facts.packages) {
      console.log('\n📂 Packages:');
      for (const p of facts.packages) {
        console.log(`   packages/${p}/`);
      }
    }

    console.log('\n🔧 Dependencies (name → version spec):');
    const deps = Object.entries(facts.dependencies).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    for (const [name, version] of deps) {
      console.log(`   ${name}: ${version}`);
    }

    if (facts.engines) {
      console.log('\n⚙️  Engines:');
      for (const [name, constraint] of Object.entries(facts.engines)) {
        console.log(`   ${name}: ${constraint}`);
      }
    }
    if (facts.packageManager) {
      console.log(`   packageManager: ${facts.packageManager}`);
    }

    console.log('\n📄 AGENTS.md content:');
    console.log('───────────────────────────────────────────────────────────');
    console.log(facts.agentsMdContent);
    console.log(
      '───────────────────────────────────────────────────────────\n'
    );
  }
}

main();
