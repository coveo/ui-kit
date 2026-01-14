import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import * as path from 'path';
import {Project, type SourceFile, SyntaxKind} from 'ts-morph';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

interface ExportInfo {
  name: string;
  kind: 'function' | 'type' | 'interface' | 'class' | 'variable' | 'const';
  file: string;
  package: string;
}

interface ScanStats {
  exports: number;
  imports: number;
}

function getPackageFromPath(filePath: string): string | null {
  const repoRoot = process.env.REPO_ROOT!;
  const relativePath = filePath.replace(repoRoot, '').replace(/^\//, '');

  if (relativePath.startsWith('packages/')) {
    const parts = relativePath.split('/');
    if (parts.length >= 2) {
      return `@coveo/${parts[1]}`;
    }
  }
  return null;
}

function getRelativeFilePath(filePath: string): string {
  const repoRoot = process.env.REPO_ROOT!;
  return filePath.replace(repoRoot, '').replace(/^\//, '');
}

async function scanExportsFromFile(
  sourceFile: SourceFile,
  session: neo4j.Session,
  stats: ScanStats
) {
  const filePath = sourceFile.getFilePath();
  const packageName = getPackageFromPath(filePath);

  if (!packageName) return;

  const relativePath = getRelativeFilePath(filePath);

  if (
    relativePath.includes('.spec.') ||
    relativePath.includes('.test.') ||
    relativePath.includes('__tests__')
  ) {
    return;
  }

  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [name, declarations] of exportedDeclarations) {
    if (name === 'default') continue;

    for (const decl of declarations) {
      let kind: ExportInfo['kind'] = 'variable';

      const kindValue = decl.getKind();
      if (kindValue === SyntaxKind.FunctionDeclaration) {
        kind = 'function';
      } else if (kindValue === SyntaxKind.TypeAliasDeclaration) {
        kind = 'type';
      } else if (kindValue === SyntaxKind.InterfaceDeclaration) {
        kind = 'interface';
      } else if (kindValue === SyntaxKind.ClassDeclaration) {
        kind = 'class';
      } else if (kindValue === SyntaxKind.VariableDeclaration) {
        // biome-ignore lint/suspicious/noExplicitAny: lab
        const initializer = (decl as any).getInitializer?.();
        if (initializer) {
          const initText = initializer.getText();
          if (
            initText.includes('=>') ||
            initText.includes('function') ||
            initText.startsWith('(')
          ) {
            kind = 'function';
          } else {
            kind = 'const';
          }
        }
      }

      await session.run(
        `
        MERGE (e:Export {name: $name, package: $package})
        ON CREATE SET e.kind = $kind, e.file = $file
        ON MATCH SET e.kind = $kind, e.file = $file
        WITH e
        MATCH (pkg:Package {name: $package})
        MERGE (pkg)-[:EXPORTS]->(e)
        `,
        {name, kind, file: relativePath, package: packageName}
      );
      stats.exports++;
    }
  }
}

async function scanImportsFromFile(
  sourceFile: SourceFile,
  session: neo4j.Session,
  stats: ScanStats
) {
  const filePath = sourceFile.getFilePath();
  const relativePath = getRelativeFilePath(filePath);

  if (
    relativePath.includes('.spec.') ||
    relativePath.includes('.test.') ||
    relativePath.includes('__tests__')
  ) {
    return;
  }

  let importerPackage: string | null = null;
  const repoRoot = process.env.REPO_ROOT!;
  const relPath = filePath.replace(repoRoot, '').replace(/^\//, '');

  if (relPath.startsWith('packages/')) {
    const parts = relPath.split('/');
    if (parts.length >= 2) {
      importerPackage = `@coveo/${parts[1]}`;
    }
  } else if (relPath.startsWith('samples/')) {
    const parts = relPath.split('/');
    if (parts.length >= 3) {
      importerPackage = `@samples/${parts[1]}-${parts[2]}`;
    }
  }

  if (!importerPackage) return;

  const imports = sourceFile.getImportDeclarations();

  for (const imp of imports) {
    const moduleSpec = imp.getModuleSpecifierValue();

    if (!moduleSpec.startsWith('@coveo/')) continue;

    const namedImports = imp.getNamedImports();
    for (const named of namedImports) {
      const importedName = named.getName();

      await session.run(
        `
        MATCH (e:Export {name: $exportName})
        WHERE e.package STARTS WITH '@coveo/'
        MATCH (importerPkg:Package {name: $importerPackage})
        MERGE (importerPkg)-[:IMPORTS {file: $file}]->(e)
        `,
        {
          exportName: importedName,
          importerPackage,
          file: relativePath,
        }
      );
      stats.imports++;
    }
  }
}

async function scanExports() {
  const session = driver.session();
  const repoRoot = process.env.REPO_ROOT!;

  const stats: ScanStats = {
    exports: 0,
    imports: 0,
  };

  const packagesToScan = [
    'headless',
    'headless-react',
    'atomic',
    'atomic-react',
    'bueno',
    'auth',
  ];

  console.log('=== Phase 1: Scanning Exports from Core Packages ===\n');

  for (const pkg of packagesToScan) {
    const pkgPath = path.join(repoRoot, 'packages', pkg);
    const tsconfigPath = path.join(pkgPath, 'tsconfig.json');

    console.log(`Scanning exports from @coveo/${pkg}...`);

    const project = new Project({
      tsConfigFilePath: tsconfigPath,
      skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(`${pkgPath}/src/**/*.ts`);
    project.addSourceFilesAtPaths(`${pkgPath}/src/**/*.tsx`);

    const sourceFiles = project.getSourceFiles();
    console.log(`  Found ${sourceFiles.length} source files`);

    let pkgExports = 0;
    for (const sourceFile of sourceFiles) {
      const beforeExports = stats.exports;
      await scanExportsFromFile(sourceFile, session, stats);
      pkgExports += stats.exports - beforeExports;
    }
    console.log(`  Exported ${pkgExports} symbols\n`);
  }

  console.log('=== Phase 2: Scanning Imports from All Packages ===\n');

  for (const pkg of packagesToScan) {
    const pkgPath = path.join(repoRoot, 'packages', pkg);
    const tsconfigPath = path.join(pkgPath, 'tsconfig.json');

    console.log(`Scanning imports in @coveo/${pkg}...`);

    const project = new Project({
      tsConfigFilePath: tsconfigPath,
      skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(`${pkgPath}/src/**/*.ts`);
    project.addSourceFilesAtPaths(`${pkgPath}/src/**/*.tsx`);

    const sourceFiles = project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      await scanImportsFromFile(sourceFile, session, stats);
    }
  }

  console.log('\n=== Phase 3: Scanning Imports from Samples ===\n');

  const samplesPath = path.join(repoRoot, 'samples');
  const sampleCategories = ['atomic', 'headless', 'headless-ssr'];

  for (const category of sampleCategories) {
    const categoryPath = path.join(samplesPath, category);
    console.log(`Scanning imports in samples/${category}...`);

    const sampleProject = new Project({
      compilerOptions: {allowJs: true, jsx: 2},
    });

    sampleProject.addSourceFilesAtPaths(`${categoryPath}/**/src/**/*.ts`);
    sampleProject.addSourceFilesAtPaths(`${categoryPath}/**/src/**/*.tsx`);
    sampleProject.addSourceFilesAtPaths(`${categoryPath}/**/app/**/*.ts`);
    sampleProject.addSourceFilesAtPaths(`${categoryPath}/**/app/**/*.tsx`);
    sampleProject.addSourceFilesAtPaths(`${categoryPath}/**/lib/**/*.ts`);
    sampleProject.addSourceFilesAtPaths(`${categoryPath}/**/lib/**/*.tsx`);

    const sampleFiles = sampleProject.getSourceFiles();
    console.log(`  Found ${sampleFiles.length} source files`);

    for (const sourceFile of sampleFiles) {
      await scanImportsFromFile(sourceFile, session, stats);
    }
  }

  console.log('\n=== Scan Complete ===');
  console.log(`  Exports tracked: ${stats.exports}`);
  console.log(`  Import links created: ${stats.imports}`);

  await session.close();
  await driver.close();
}

scanExports();
