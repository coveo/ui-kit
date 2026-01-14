import * as dotenv from 'dotenv';
import * as glob from 'glob';
import neo4j from 'neo4j-driver';
import * as path from 'path';
import {Project, SyntaxKind} from 'ts-morph';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

async function scanSamples() {
  const session = driver.session();
  const project = new Project({compilerOptions: {allowJs: true, jsx: 1}}); // Enable JSX/TSX

  // 1. Locate Samples Directory
  // Assuming a folder structure like /samples or /apps
  const samplesRoot = path.join(process.env.REPO_ROOT!, 'samples');
  // OR if they are inside /packages: path.join(process.env.REPO_ROOT!, "packages", "samples");

  console.log(`Scanning Samples from: ${samplesRoot}`);

  // Find all sample subdirectories
  const sampleDirs = glob.sync(`${samplesRoot}/*/`);

  for (const dir of sampleDirs) {
    const sampleName = path.basename(dir);

    // Create Application Node
    await session.run(
      `
        MERGE (app:Application {name: $name, type: 'sample'})
      `,
      {name: sampleName}
    );

    console.log(`Processing Sample: ${sampleName}`);

    // 2. Scan source files in this sample
    const sourceFiles = glob.sync(`${dir}/src/**/*.{ts,tsx,js,jsx}`);
    project.addSourceFilesAtPaths(sourceFiles);

    for (const sourceFile of project.getSourceFiles()) {
      // A. Check for Atomic Component Usage (DOM Analysis)
      // Look for JSX tags like <atomic-search-box>
      if (
        sourceFile.getBaseName().endsWith('tsx') ||
        sourceFile.getBaseName().endsWith('jsx')
      ) {
        sourceFile.forEachDescendant((node) => {
          if (
            node.getKind() === SyntaxKind.JsxSelfClosingElement ||
            node.getKind() === SyntaxKind.JsxOpeningElement
          ) {
            const split = node.getText().split(/[ >]/);
            const tagName = (split.at(0) ?? '').replace('<', '');
            if (tagName.startsWith('atomic-')) {
              session.run(
                `
                              MATCH (app:Application {name: $appName})
                              MATCH (comp:Component {tag: $tagName})
                              MERGE (app)-[:USES_COMPONENT]->(comp)
                          `,
                {appName: sampleName, tagName: tagName}
              );
            }
          }
        });
      }

      // B. Check for Headless Controller Usage (Direct Imports)
      // e.g. import { buildSearchBox } from '@coveo/headless';
      const imports = sourceFile.getImportDeclarations();
      for (const imp of imports) {
        if (imp.getModuleSpecifierValue().includes('@coveo/headless')) {
          const namedImports = imp.getNamedImports();
          for (const named of namedImports) {
            const importName = named.getName();
            if (importName.startsWith('build')) {
              const controllerName = importName.replace('build', '');
              session.run(
                `
                              MATCH (app:Application {name: $appName})
                              MERGE (cont:Controller {name: $cName})
                              MERGE (app)-[:CONSUMES]->(cont)
                          `,
                {appName: sampleName, cName: controllerName}
              );
              console.log(`[${sampleName}] Uses Controller: ${controllerName}`);
            }
          }
        }
      }
    }
    // Clear project memory after each sample to avoid OOM
    for (const file of project.getSourceFiles()) {
      project.removeSourceFile(file);
    }
  }

  await session.close();
  await driver.close();
}

scanSamples();
