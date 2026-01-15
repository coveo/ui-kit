import * as dotenv from 'dotenv';
import * as fs from 'fs';
import neo4j from 'neo4j-driver';
import * as path from 'path';
import {Project, SyntaxKind} from 'ts-morph';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

interface SampleInfo {
  name: string;
  category: string;
  path: string;
}

interface ScanStats {
  samples: number;
  controllerLinks: number;
  componentLinks: number;
}

const SOURCE_DIRECTORIES = [
  'src',
  'app',
  'pages',
  'lib',
  'components',
  'hooks',
  'actions',
];

function pascalToKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function findComponentsInHtmlFiles(
  samplePath: string,
  componentsFound: Set<string>
) {
  const htmlExtensions = ['.html', '.vue'];

  function walkForHtml(dir: string) {
    if (!fs.existsSync(dir)) return;

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkForHtml(fullPath);
      } else if (htmlExtensions.some((ext) => entry.name.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const matches = content.matchAll(/<(atomic-[a-z-]+)/g);
          for (const match of matches) {
            if (match[1]) {
              componentsFound.add(match[1]);
            }
          }
        } catch {}
      }
    }
  }

  walkForHtml(samplePath);
}

function hasSourceDirectory(samplePath: string): boolean {
  for (const dir of SOURCE_DIRECTORIES) {
    const dirPath = path.join(samplePath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      return true;
    }
  }
  return false;
}

function findSampleDirectories(samplesRoot: string): SampleInfo[] {
  const samples: SampleInfo[] = [];

  const categories = fs
    .readdirSync(samplesRoot, {withFileTypes: true})
    .filter(
      (d) =>
        d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules'
    )
    .map((d) => d.name);

  for (const category of categories) {
    const categoryPath = path.join(samplesRoot, category);

    const subDirs = fs
      .readdirSync(categoryPath, {withFileTypes: true})
      .filter(
        (d) =>
          d.isDirectory() &&
          !d.name.startsWith('.') &&
          d.name !== 'node_modules'
      );

    for (const subDir of subDirs) {
      const samplePath = path.join(categoryPath, subDir.name);

      if (hasSourceDirectory(samplePath)) {
        samples.push({
          name: subDir.name,
          category,
          path: samplePath,
        });
      } else {
        const nestedDirs = fs
          .readdirSync(samplePath, {withFileTypes: true})
          .filter(
            (d) =>
              d.isDirectory() &&
              !d.name.startsWith('.') &&
              d.name !== 'node_modules'
          );

        for (const nestedDir of nestedDirs) {
          const nestedPath = path.join(samplePath, nestedDir.name);

          if (hasSourceDirectory(nestedPath)) {
            samples.push({
              name: `${subDir.name}/${nestedDir.name}`,
              category,
              path: nestedPath,
            });
          }
        }
      }
    }
  }

  return samples;
}

/**
 * Find all source files in a directory, including common locations like:
 * - src/
 * - app/ (for Next.js app router)
 * - pages/ (for Next.js pages router)
 * - components/
 * - lib/
 */
function findSourceFiles(samplePath: string): string[] {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const ignoreDirs = ['node_modules', '.next', 'dist', 'build', '.git'];
  const files: string[] = [];

  const visitedDirectories = new Set<string>();

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;

    let realPath: string;
    try {
      realPath = fs.realpathSync.native(dir);
    } catch {
      return;
    }

    if (visitedDirectories.has(realPath)) {
      return;
    }
    visitedDirectories.add(realPath);

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignoreDirs.includes(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        try {
          if (!fs.lstatSync(fullPath).isSymbolicLink()) {
            walk(fullPath);
          }
        } catch {}
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  // Walk through common source directories
  const commonDirs = [
    'src',
    'app',
    'pages',
    'components',
    'lib',
    'utils',
    'hooks',
  ];
  for (const dir of commonDirs) {
    walk(path.join(samplePath, dir));
  }

  // Also check root-level files (some samples have files at root)
  const rootFiles = fs
    .readdirSync(samplePath, {withFileTypes: true})
    .filter((e) => e.isFile() && extensions.some((ext) => e.name.endsWith(ext)))
    .map((e) => path.join(samplePath, e.name));

  return [...files, ...rootFiles];
}

async function linkApplicationToPackage(
  session: neo4j.Session,
  appName: string,
  absolutePath: string
) {
  const relativePath = absolutePath.replace(process.env.REPO_ROOT + '/', '');
  await session.run(
    `
    MATCH (app:Application {name: $appName})
    MATCH (pkg:Package)
    WHERE pkg.path = $relativePath
    MERGE (app)-[:IS_PACKAGE]->(pkg)
    `,
    {appName, relativePath}
  );
}

async function scanSamples() {
  const session = driver.session();
  const project = new Project({
    compilerOptions: {allowJs: true, jsx: 2}, // jsx: 2 = react
  });

  const samplesRoot = path.join(process.env.REPO_ROOT!, 'samples');
  console.log(`Scanning Samples from: ${samplesRoot}\n`);

  // Find all sample directories
  const samples = findSampleDirectories(samplesRoot);
  console.log(`Found ${samples.length} samples:\n`);

  const stats: ScanStats = {
    samples: 0,
    controllerLinks: 0,
    componentLinks: 0,
  };

  for (const sample of samples) {
    const fullName = `${sample.category}/${sample.name}`;

    // Create Application node
    await session.run(
      `
      MERGE (app:Application {name: $name})
      SET app.type = 'sample',
          app.category = $category,
          app.path = $path
      `,
      {name: fullName, category: sample.category, path: sample.path}
    );

    await linkApplicationToPackage(session, fullName, sample.path);

    stats.samples++;

    console.log(`[${sample.category}] ${sample.name}`);

    // Find source files
    const sourceFiles = findSourceFiles(sample.path);
    console.log(`  Found ${sourceFiles.length} source files`);

    if (sourceFiles.length === 0) {
      console.log(`  Skipping - no source files found`);
      continue;
    }

    const sourceFileObjects = sourceFiles.map((f) =>
      project.addSourceFileAtPath(f)
    );

    const controllersFound = new Set<string>();
    const componentsFound = new Set<string>();

    for (const sourceFile of sourceFileObjects) {
      const imports = sourceFile.getImportDeclarations();
      for (const imp of imports) {
        const moduleSpec = imp.getModuleSpecifierValue();

        if (moduleSpec.includes('@coveo/headless')) {
          const namedImports = imp.getNamedImports();
          for (const named of namedImports) {
            const importName = named.getName();
            if (importName.startsWith('build') && importName.length > 5) {
              const controllerName = importName.replace('build', '');
              if (!controllersFound.has(controllerName)) {
                controllersFound.add(controllerName);
                await session.run(
                  `
                  MATCH (app:Application {name: $appName})
                  MERGE (cont:Controller {name: $cName})
                  MERGE (app)-[:CONSUMES]->(cont)
                  `,
                  {appName: fullName, cName: controllerName}
                );
                stats.controllerLinks++;
              }
            }
          }
        }

        if (moduleSpec.includes('@coveo/atomic-react')) {
          const namedImports = imp.getNamedImports();
          for (const named of namedImports) {
            const importName = named.getName();
            if (importName.startsWith('Atomic')) {
              const tagName = pascalToKebab(importName);
              if (!componentsFound.has(tagName)) {
                componentsFound.add(tagName);
              }
            }
          }
        }
      }

      const fileName = sourceFile.getBaseName();
      if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
        sourceFile.forEachDescendant((node) => {
          if (
            node.getKind() === SyntaxKind.JsxSelfClosingElement ||
            node.getKind() === SyntaxKind.JsxOpeningElement
          ) {
            const text = node.getText();
            const match = text.match(/^<(atomic-[a-z-]+)/);
            if (match?.[1]) {
              const tagName = match[1];
              if (!componentsFound.has(tagName)) {
                componentsFound.add(tagName);
              }
            }
          }
        });
      }
    }

    findComponentsInHtmlFiles(sample.path, componentsFound);

    // Create component links (outside the forEachDescendant)
    for (const tagName of componentsFound) {
      await session.run(
        `
        MATCH (app:Application {name: $appName})
        MATCH (comp:Component {tag: $tagName})
        MERGE (app)-[:USES_COMPONENT]->(comp)
        `,
        {appName: fullName, tagName}
      );
      stats.componentLinks++;
    }

    // Log what was found
    if (controllersFound.size > 0) {
      console.log(`  Controllers: ${Array.from(controllersFound).join(', ')}`);
    }
    if (componentsFound.size > 0) {
      console.log(`  Components: ${Array.from(componentsFound).join(', ')}`);
    }

    for (const file of sourceFileObjects) {
      project.removeSourceFile(file);
    }
  }

  console.log('\n=== Scan Complete ===');
  console.log(`  Samples: ${stats.samples}`);
  console.log(`  Controller links: ${stats.controllerLinks}`);
  console.log(`  Component links: ${stats.componentLinks}`);

  await session.close();
  await driver.close();
}

scanSamples();
