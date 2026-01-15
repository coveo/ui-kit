import * as dotenv from 'dotenv';
import * as fs from 'fs';
import {glob} from 'glob';
import neo4j from 'neo4j-driver';
import * as path from 'path';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

interface ExportEntry {
  name: string;
  kind: 'function' | 'type' | 'interface' | 'class' | 'const' | 'variable';
  sourceFile: string;
}

interface ImportEntry {
  name: string;
  from: string;
  file: string;
}

interface ScanStats {
  exports: number;
  imports: number;
}

const HEADLESS_ENTRY_POINTS = [
  {file: 'src/index.ts', entryPoint: '@coveo/headless'},
  {file: 'src/insight.index.ts', entryPoint: '@coveo/headless/insight'},
  {file: 'src/commerce.index.ts', entryPoint: '@coveo/headless/commerce'},
  {
    file: 'src/recommendation.index.ts',
    entryPoint: '@coveo/headless/recommendation',
  },
  {file: 'src/case-assist.index.ts', entryPoint: '@coveo/headless/case-assist'},
  {file: 'src/ssr.index.ts', entryPoint: '@coveo/headless/ssr'},
  {
    file: 'src/ssr-commerce.index.ts',
    entryPoint: '@coveo/headless/ssr-commerce',
  },
];

function getRelativeFilePath(filePath: string): string {
  const repoRoot = process.env.REPO_ROOT!;
  return filePath.replace(repoRoot, '').replace(/^\//, '');
}

function inferKindFromName(
  name: string
): 'function' | 'type' | 'interface' | 'class' | 'const' | 'variable' {
  if (
    name.startsWith('build') ||
    name.startsWith('get') ||
    name.startsWith('create')
  ) {
    return 'function';
  }
  if (name[0] === name[0]?.toUpperCase() && !name.includes('_')) {
    return 'type';
  }
  return 'const';
}

function resolveImportPath(fromFile: string, importPath: string): string {
  if (importPath.startsWith('.')) {
    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);

    if (!resolved.endsWith('.ts') && !resolved.endsWith('.tsx')) {
      if (fs.existsSync(resolved + '.ts')) {
        resolved += '.ts';
      } else if (fs.existsSync(resolved + '.tsx')) {
        resolved += '.tsx';
      } else if (fs.existsSync(path.join(resolved, 'index.ts'))) {
        resolved = path.join(resolved, 'index.ts');
      }
    }
    return getRelativeFilePath(resolved.replace(/\.js$/, '.ts'));
  }
  return importPath;
}

function parseExportsFromIndexFile(filePath: string): ExportEntry[] {
  const exports: ExportEntry[] = [];

  if (!fs.existsSync(filePath)) {
    return exports;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const relativeFile = getRelativeFilePath(filePath);

  // Pattern: export {Foo, Bar} from './path'
  const reExportRegex = /^export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/gm;
  let match: RegExpExecArray | null;

  while ((match = reExportRegex.exec(content)) !== null) {
    const namesStr = match[1] ?? '';
    const fromPath = match[2] ?? '';
    if (!namesStr || !fromPath) continue;

    const resolvedPath = resolveImportPath(filePath, fromPath);
    const names = namesStr.split(',').map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts.at(-1)?.trim() ?? '';
    });

    for (const name of names) {
      if (name && name !== 'default') {
        exports.push({
          name,
          kind: inferKindFromName(name),
          sourceFile: resolvedPath,
        });
      }
    }
  }

  // Pattern: export type {Foo} from './path'
  const typeReExportRegex =
    /^export\s+type\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/gm;
  while ((match = typeReExportRegex.exec(content)) !== null) {
    const namesStr = match[1] ?? '';
    const fromPath = match[2] ?? '';
    if (!namesStr || !fromPath) continue;

    const resolvedPath = resolveImportPath(filePath, fromPath);
    const names = namesStr.split(',').map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts.at(-1)?.trim() ?? '';
    });

    for (const name of names) {
      if (name && name !== 'default') {
        exports.push({name, kind: 'type', sourceFile: resolvedPath});
      }
    }
  }

  // Pattern: export function foo
  const funcRegex = /^export\s+function\s+(\w+)/gm;
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[1] ?? '';
    if (name) {
      exports.push({name, kind: 'function', sourceFile: relativeFile});
    }
  }

  // Pattern: export const foo
  const constRegex = /^export\s+const\s+(\w+)/gm;
  while ((match = constRegex.exec(content)) !== null) {
    const name = match[1] ?? '';
    if (name) {
      exports.push({name, kind: 'const', sourceFile: relativeFile});
    }
  }

  // Pattern: export class Foo
  const classRegex = /^export\s+class\s+(\w+)/gm;
  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1] ?? '';
    if (name) {
      exports.push({name, kind: 'class', sourceFile: relativeFile});
    }
  }

  // Pattern: export interface Foo
  const interfaceRegex = /^export\s+interface\s+(\w+)/gm;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1] ?? '';
    if (name) {
      exports.push({name, kind: 'interface', sourceFile: relativeFile});
    }
  }

  // Pattern: export type Foo = ...
  const typeDefRegex = /^export\s+type\s+(\w+)\s*=/gm;
  while ((match = typeDefRegex.exec(content)) !== null) {
    const name = match[1] ?? '';
    if (name) {
      exports.push({name, kind: 'type', sourceFile: relativeFile});
    }
  }

  return exports;
}

function parseImportsFromFile(filePath: string): ImportEntry[] {
  const imports: ImportEntry[] = [];

  if (!fs.existsSync(filePath)) {
    return imports;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = getRelativeFilePath(filePath);

  // Pattern: import {Foo, Bar} from '@coveo/...'
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"](@coveo\/[^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const namesStr = match[1] ?? '';
    const from = match[2] ?? '';
    if (!namesStr || !from) continue;

    const names = namesStr.split(',').map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[0]?.trim() ?? '';
    });

    for (const name of names) {
      if (name && !name.startsWith('type ')) {
        imports.push({name, from, file: relativePath});
      }
    }
  }

  // Pattern: import type {Foo} from '@coveo/...'
  const typeImportRegex =
    /import\s+type\s*\{([^}]+)\}\s*from\s*['"](@coveo\/[^'"]+)['"]/g;
  while ((match = typeImportRegex.exec(content)) !== null) {
    const namesStr = match[1] ?? '';
    const from = match[2] ?? '';
    if (!namesStr || !from) continue;

    const names = namesStr.split(',').map(
      (n) =>
        n
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim() ?? ''
    );

    for (const name of names) {
      if (name) {
        imports.push({name, from, file: relativePath});
      }
    }
  }

  return imports;
}

async function scanPackageExports(
  pkgPath: string,
  packageName: string,
  entryPoints: Array<{file: string; entryPoint: string}>,
  session: neo4j.Session,
  stats: ScanStats
) {
  for (const {file, entryPoint} of entryPoints) {
    const entryFilePath = path.join(pkgPath, file);

    if (!fs.existsSync(entryFilePath)) {
      console.log(`  Skipping ${file} (not found)`);
      continue;
    }

    console.log(`  Scanning ${entryPoint}...`);
    const exports = parseExportsFromIndexFile(entryFilePath);

    for (const exp of exports) {
      await session.run(
        `
        MERGE (e:Export {name: $name, package: $package})
        ON CREATE SET e.kind = $kind, e.file = $file, e.entryPoint = $entryPoint
        ON MATCH SET e.kind = $kind, e.file = $file, e.entryPoint = $entryPoint
        WITH e
        MATCH (pkg:Package {name: $packageBase})
        MERGE (pkg)-[:EXPORTS]->(e)
        `,
        {
          name: exp.name,
          kind: exp.kind,
          file: exp.sourceFile,
          package: packageName,
          packageBase: packageName.split('/').slice(0, 2).join('/'),
          entryPoint,
        }
      );
      stats.exports++;
    }

    console.log(`    Found ${exports.length} exports`);
  }
}

async function scanPackageImports(
  pkgPath: string,
  importerPackage: string,
  session: neo4j.Session,
  stats: ScanStats
) {
  const files = await glob(`${pkgPath}/src/**/*.{ts,tsx}`, {
    ignore: [
      '**/*.spec.*',
      '**/*.test.*',
      '**/__tests__/**',
      '**/node_modules/**',
    ],
  });

  console.log(`  Found ${files.length} source files`);

  const processedImports = new Set<string>();
  let importCount = 0;

  for (const file of files) {
    const imports = parseImportsFromFile(file);

    for (const imp of imports) {
      const key = `${importerPackage}:${imp.name}:${imp.from}`;
      if (processedImports.has(key)) continue;
      processedImports.add(key);

      await session.run(
        `
        MATCH (e:Export {name: $exportName})
        WHERE e.package STARTS WITH '@coveo/'
        MATCH (importerPkg:Package {name: $importerPackage})
        MERGE (importerPkg)-[:IMPORTS {file: $file, from: $moduleSpec}]->(e)
        `,
        {
          exportName: imp.name,
          importerPackage,
          file: imp.file,
          moduleSpec: imp.from,
        }
      );
      importCount++;
      stats.imports++;
    }
  }

  console.log(`    Created ${importCount} import links`);
}

async function scanSampleImports(
  samplesPath: string,
  category: string,
  session: neo4j.Session,
  stats: ScanStats
) {
  const categoryPath = path.join(samplesPath, category);
  const patterns = [
    `${categoryPath}/**/src/**/*.{ts,tsx}`,
    `${categoryPath}/**/app/**/*.{ts,tsx}`,
    `${categoryPath}/**/lib/**/*.{ts,tsx}`,
  ];

  let allFiles: string[] = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/*.spec.*', '**/*.test.*'],
    });
    allFiles = allFiles.concat(files);
  }

  console.log(`  Found ${allFiles.length} source files`);

  const processedImports = new Set<string>();
  const importerPackage = `@samples/${category}`;
  let importCount = 0;

  for (const file of allFiles) {
    const imports = parseImportsFromFile(file);

    for (const imp of imports) {
      const key = `${importerPackage}:${imp.name}:${imp.from}`;
      if (processedImports.has(key)) continue;
      processedImports.add(key);

      await session.run(
        `
        MATCH (e:Export {name: $exportName})
        WHERE e.package STARTS WITH '@coveo/'
        MATCH (importerPkg:Package {name: $importerPackage})
        MERGE (importerPkg)-[:IMPORTS {file: $file, from: $moduleSpec}]->(e)
        `,
        {
          exportName: imp.name,
          importerPackage,
          file: imp.file,
          moduleSpec: imp.from,
        }
      );
      importCount++;
      stats.imports++;
    }
  }

  console.log(`    Created ${importCount} import links`);
}

async function scanExports() {
  const session = driver.session();
  const repoRoot = process.env.REPO_ROOT!;

  const stats: ScanStats = {exports: 0, imports: 0};

  console.log('=== Clearing existing Export data ===\n');
  await session.run('MATCH (e:Export) DETACH DELETE e');

  console.log('=== Phase 1: Scanning Public API Exports ===\n');

  const headlessPath = path.join(repoRoot, 'packages', 'headless');
  console.log('Scanning @coveo/headless...');
  await scanPackageExports(
    headlessPath,
    '@coveo/headless',
    HEADLESS_ENTRY_POINTS,
    session,
    stats
  );

  const otherPackages = [
    {
      name: 'atomic',
      entryPoints: [{file: 'src/index.ts', entryPoint: '@coveo/atomic'}],
    },
    {
      name: 'bueno',
      entryPoints: [{file: 'src/index.ts', entryPoint: '@coveo/bueno'}],
    },
    {
      name: 'auth',
      entryPoints: [{file: 'src/index.ts', entryPoint: '@coveo/auth'}],
    },
    {
      name: 'atomic-react',
      entryPoints: [{file: 'src/index.ts', entryPoint: '@coveo/atomic-react'}],
    },
    {
      name: 'headless-react',
      entryPoints: [
        {file: 'src/index.ts', entryPoint: '@coveo/headless-react'},
      ],
    },
  ];

  for (const pkg of otherPackages) {
    const pkgPath = path.join(repoRoot, 'packages', pkg.name);
    if (fs.existsSync(pkgPath)) {
      console.log(`\nScanning @coveo/${pkg.name}...`);
      await scanPackageExports(
        pkgPath,
        `@coveo/${pkg.name}`,
        pkg.entryPoints,
        session,
        stats
      );
    }
  }

  console.log('\n=== Phase 2: Scanning Imports from Packages ===\n');

  const packagesToScan = [
    'headless',
    'headless-react',
    'atomic',
    'atomic-react',
    'bueno',
    'auth',
  ];

  for (const pkg of packagesToScan) {
    const pkgPath = path.join(repoRoot, 'packages', pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`Scanning imports in @coveo/${pkg}...`);
      await scanPackageImports(pkgPath, `@coveo/${pkg}`, session, stats);
    }
  }

  console.log('\n=== Phase 3: Scanning Imports from Samples ===\n');

  const samplesPath = path.join(repoRoot, 'samples');
  const sampleCategories = ['atomic', 'headless', 'headless-ssr'];

  for (const category of sampleCategories) {
    console.log(`Scanning samples/${category}...`);
    await scanSampleImports(samplesPath, category, session, stats);
  }

  console.log('\n=== Scan Complete ===');
  console.log(`  Exports tracked: ${stats.exports}`);
  console.log(`  Import links created: ${stats.imports}`);

  await session.close();
  await driver.close();
}

scanExports();
