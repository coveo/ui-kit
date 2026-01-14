import * as dotenv from 'dotenv';
import * as fs from 'fs';
import neo4j from 'neo4j-driver';
import * as path from 'path';

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  path: string;
  type: 'package' | 'sample' | 'util';
  dependencies: string[];
  devDependencies: string[];
  peerDependencies: string[];
}

function findPackageJsonFiles(
  dir: string,
  ignore: string[] = ['node_modules', 'dist', '.git']
): string[] {
  const results: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, {withFileTypes: true});

    for (const entry of entries) {
      if (ignore.includes(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'package.json') {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function getPackageType(relativePath: string): 'package' | 'sample' | 'util' {
  if (relativePath.startsWith('samples/')) return 'sample';
  if (relativePath.startsWith('utils/')) return 'util';
  return 'package';
}

function parsePackageJson(
  filePath: string,
  repoRoot: string
): PackageInfo | null {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const relativePath = path.relative(repoRoot, path.dirname(filePath));

    if (!content.name) return null;

    const getCoveoDeps = (
      deps: Record<string, string> | undefined
    ): string[] => {
      if (!deps) return [];
      return Object.keys(deps).filter((d) => d.startsWith('@coveo/'));
    };

    return {
      name: content.name,
      version: content.version || '0.0.0',
      description: content.description || '',
      path: relativePath,
      type: getPackageType(relativePath),
      dependencies: getCoveoDeps(content.dependencies),
      devDependencies: getCoveoDeps(content.devDependencies),
      peerDependencies: getCoveoDeps(content.peerDependencies),
    };
  } catch {
    return null;
  }
}

async function scanPackages() {
  const session = driver.session();
  const repoRoot = process.env.REPO_ROOT!;

  console.log('=== Clearing existing Package data ===');
  await session.run(`MATCH (p:Package) DETACH DELETE p`);

  console.log('\n=== Scanning for packages ===');

  const packageFiles = [
    ...findPackageJsonFiles(path.join(repoRoot, 'packages')),
    ...findPackageJsonFiles(path.join(repoRoot, 'samples')),
    ...findPackageJsonFiles(path.join(repoRoot, 'utils')),
  ];

  console.log(`Found ${packageFiles.length} package.json files\n`);

  const packages: PackageInfo[] = [];
  for (const file of packageFiles) {
    const pkg = parsePackageJson(file, repoRoot);
    if (pkg) packages.push(pkg);
  }

  console.log(`Parsed ${packages.length} valid packages\n`);

  let packageCount = 0;
  let depCount = 0;
  let devDepCount = 0;
  let peerDepCount = 0;

  for (const pkg of packages) {
    await session.run(
      `CREATE (p:Package {
        name: $name,
        version: $version,
        description: $description,
        path: $path,
        type: $type
      })`,
      {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        path: pkg.path,
        type: pkg.type,
      }
    );
    packageCount++;
    console.log(`[${pkg.type}] ${pkg.name} (${pkg.path})`);

    for (const dep of pkg.dependencies) {
      await session.run(
        `
        MATCH (source:Package {name: $sourceName})
        MERGE (target:Package {name: $targetName})
        ON CREATE SET target.external = true
        MERGE (source)-[:DEPENDS_ON]->(target)
        `,
        {sourceName: pkg.name, targetName: dep}
      );
      depCount++;
      console.log(`  -> ${dep}`);
    }

    for (const dep of pkg.devDependencies) {
      await session.run(
        `
        MATCH (source:Package {name: $sourceName})
        MERGE (target:Package {name: $targetName})
        ON CREATE SET target.external = true
        MERGE (source)-[:DEV_DEPENDS_ON]->(target)
        `,
        {sourceName: pkg.name, targetName: dep}
      );
      devDepCount++;
      console.log(`  -> ${dep} (dev)`);
    }

    for (const dep of pkg.peerDependencies) {
      await session.run(
        `
        MATCH (source:Package {name: $sourceName})
        MERGE (target:Package {name: $targetName})
        ON CREATE SET target.external = true
        MERGE (source)-[:PEER_DEPENDS_ON]->(target)
        `,
        {sourceName: pkg.name, targetName: dep}
      );
      peerDepCount++;
      console.log(`  -> ${dep} (peer)`);
    }
  }

  console.log('\n=== Linking Packages to Components ===');
  const linkResult = await session.run(`
    MATCH (p:Package), (c:Component)
    WHERE p.path IS NOT NULL AND c.file CONTAINS ('/' + p.path + '/')
    MERGE (p)-[:CONTAINS]->(c)
    RETURN count(*) as linked
  `);
  console.log(
    `Linked ${linkResult.records[0]?.get('linked')} components to packages`
  );

  console.log('\n=== Linking Packages to Controllers ===');
  const ctrlResult = await session.run(`
    MATCH (p:Package), (ctrl:Controller)
    WHERE p.path IS NOT NULL AND ctrl.file CONTAINS ('/' + p.path + '/')
    MERGE (p)-[:CONTAINS]->(ctrl)
    RETURN count(*) as linked
  `);
  console.log(
    `Linked ${ctrlResult.records[0]?.get('linked')} controllers to packages`
  );

  console.log('\n=== Linking Packages to Reducers ===');
  const reducerResult = await session.run(`
    MATCH (p:Package), (r:Reducer)
    WHERE p.path IS NOT NULL AND r.file CONTAINS ('/' + p.path + '/')
    MERGE (p)-[:CONTAINS]->(r)
    RETURN count(*) as linked
  `);
  console.log(
    `Linked ${reducerResult.records[0]?.get('linked')} reducers to packages`
  );

  console.log('\n=== Scan Complete ===');
  console.log(`  Packages: ${packageCount}`);
  console.log(`  Dependencies: ${depCount}`);
  console.log(`  Dev Dependencies: ${devDepCount}`);
  console.log(`  Peer Dependencies: ${peerDepCount}`);

  await session.close();
  await driver.close();
}

scanPackages();
