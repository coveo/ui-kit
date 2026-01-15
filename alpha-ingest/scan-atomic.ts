import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import {type ClassDeclaration, Project, SyntaxKind} from 'ts-morph';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

interface PropertyInfo {
  name: string;
  type: string;
  attribute: string | null;
  defaultValue: string | null;
  reflect: boolean;
  description: string | null;
}

interface ScanStats {
  components: number;
  properties: number;
  controllerLinks: number;
}

/**
 * Extract @property() decorated properties from a Lit component class.
 */
function extractProperties(cls: ClassDeclaration): PropertyInfo[] {
  const properties: PropertyInfo[] = [];

  for (const prop of cls.getProperties()) {
    const decorator = prop.getDecorator('property');
    if (!decorator) {
      continue;
    }

    const propName = prop.getName();

    // Get the TypeScript type
    const typeNode = prop.getTypeNode();
    let tsType = typeNode?.getText() ?? 'unknown';

    // Get default value
    const initializer = prop.getInitializer();
    const defaultValue = initializer?.getText() ?? null;

    // Parse decorator options: @property({type: Number, attribute: 'foo', reflect: true})
    let attribute: string | null = null;
    let reflect = false;
    let litType = '';

    const args = decorator.getArguments();
    if (args.length > 0) {
      const argText = args[0]?.getText() ?? '';

      // Extract attribute name
      const attrMatch = argText.match(/attribute:\s*['"]([^'"]+)['"]/);
      if (attrMatch) {
        attribute = attrMatch[1] ?? null;
      }

      // Extract reflect
      reflect = /reflect:\s*true/.test(argText);

      // Extract Lit type (Number, String, Boolean, etc.)
      const typeMatch = argText.match(/type:\s*(\w+)/);
      if (typeMatch) {
        litType = typeMatch[1] ?? '';
      }
    }

    // If no explicit attribute, Lit uses the property name as-is (lowercased)
    if (!attribute) {
      attribute = propName.toLowerCase();
    }

    // Prefer Lit type if available, otherwise use TS type
    if (litType) {
      tsType = litType.toLowerCase();
    }

    // Extract JSDoc description
    const jsDocs = prop.getJsDocs();
    let description: string | null = null;
    if (jsDocs.length > 0) {
      description = jsDocs[0]?.getDescription().trim() ?? null;
    }

    properties.push({
      name: propName,
      type: tsType,
      attribute,
      defaultValue,
      reflect,
      description,
    });
  }

  return properties;
}

async function scanAtomic() {
  const session = driver.session();
  const project = new Project({
    tsConfigFilePath: `${process.env.REPO_ROOT}/packages/atomic/tsconfig.json`,
    skipAddingFilesFromTsConfig: true,
  });

  const atomicPaths = [
    `${process.env.REPO_ROOT}/packages/atomic/src/components/**/*.ts`,
    `${process.env.REPO_ROOT}/packages/atomic/src/components/**/*.tsx`,
  ];
  project.addSourceFilesAtPaths(atomicPaths);

  console.log(
    `Scanning ${project.getSourceFiles().length} files for Lit components...`
  );

  const stats: ScanStats = {
    components: 0,
    properties: 0,
    controllerLinks: 0,
  };

  for (const sourceFile of project.getSourceFiles()) {
    const fileName = sourceFile.getBaseName();
    if (
      fileName.includes('.spec.') ||
      fileName.includes('.test.') ||
      fileName.includes('.stories.')
    ) {
      continue;
    }

    const classes = sourceFile.getClasses();
    for (const cls of classes) {
      const isLit = Boolean(cls.getDecorator('customElement'));
      const isStencil = Boolean(cls.getDecorator('Component'));

      if (!isLit && !isStencil) {
        continue;
      }

      const decorator =
        cls.getDecorator('customElement') ?? cls.getDecorator('Component');
      const args = decorator?.getArguments() ?? [];
      const firstArg = args[0];
      if (!firstArg) {
        continue;
      }

      const tagName = firstArg.getText().replace(/['"]/g, '');
      if (!tagName || !tagName.startsWith('atomic-')) {
        continue;
      }

      // Create Component node
      await session.run(`MERGE (c:Component {tag: $tag, file: $file})`, {
        tag: tagName,
        file: sourceFile.getFilePath(),
      });
      stats.components++;
      console.log(`Found component: ${tagName}`);

      // Extract and create Property nodes
      const properties = extractProperties(cls);
      for (const prop of properties) {
        await session.run(
          `
          MATCH (c:Component {tag: $tag})
          MERGE (p:Property {name: $name, component: $tag})
          SET p.type = $type,
              p.attribute = $attribute,
              p.defaultValue = $defaultValue,
              p.reflect = $reflect,
              p.description = $description
          MERGE (c)-[:HAS_PROPERTY]->(p)
          `,
          {
            tag: tagName,
            name: prop.name,
            type: prop.type,
            attribute: prop.attribute,
            defaultValue: prop.defaultValue,
            reflect: prop.reflect,
            description: prop.description,
          }
        );
        stats.properties++;
        console.log(
          `  Property: ${prop.name} (${prop.attribute}) : ${prop.type} = ${prop.defaultValue ?? 'undefined'}`
        );
      }

      // Link to controllers via imports
      const imports = sourceFile.getImportDeclarations();
      for (const imp of imports) {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        if (!moduleSpecifier.includes('@coveo/headless')) {
          continue;
        }

        const namedImports = imp.getNamedImports();
        for (const named of namedImports) {
          const importName = named.getName();
          if (importName.startsWith('build')) {
            const controllerName = importName.replace('build', '');

            await session.run(
              `
              MATCH (comp:Component {tag: $tag})
              MERGE (cont:Controller {name: $cName})
              MERGE (comp)-[:CONSUMES]->(cont)
              `,
              {tag: tagName, cName: controllerName}
            );
            stats.controllerLinks++;
            console.log(`  Linked ${tagName} -> ${controllerName}`);
          }
        }
      }

      // Link to controllers via method calls (e.g., this.searchBox = buildSearchBox(...))
      for (const method of cls.getMethods()) {
        for (const call of method.getDescendantsOfKind(
          SyntaxKind.CallExpression
        )) {
          const callText = call.getExpression().getText();
          if (callText.startsWith('build')) {
            const controllerName = callText.replace('build', '');
            await session.run(
              `
              MATCH (comp:Component {tag: $tag})
              MERGE (cont:Controller {name: $cName})
              MERGE (comp)-[:CONSUMES]->(cont)
              `,
              {tag: tagName, cName: controllerName}
            );
            stats.controllerLinks++;
            console.log(`  Linked ${tagName} -> ${controllerName} (via call)`);
          }
        }
      }
    }
  }

  console.log(`\nScan complete!`);
  console.log(`  Components found: ${stats.components}`);
  console.log(`  Properties found: ${stats.properties}`);
  console.log(`  Controller links created: ${stats.controllerLinks}`);

  await session.close();
  await driver.close();
}

scanAtomic();
