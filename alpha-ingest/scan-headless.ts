import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import {Project, type SourceFile, SyntaxKind} from 'ts-morph';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

interface ScanStats {
  controllers: number;
  actions: number;
  reducers: number;
  controllerActionLinks: number;
  reducerActionLinks: number;
}

async function scanControllers(
  sourceFile: SourceFile,
  session: neo4j.Session,
  stats: ScanStats
) {
  const fileName = sourceFile.getBaseName();
  if (
    !fileName.startsWith('headless-') ||
    fileName.includes('.spec.') ||
    fileName.includes('.test.')
  ) {
    return;
  }

  const functions = sourceFile.getFunctions();
  for (const func of functions) {
    const funcName = func.getName();
    if (!funcName?.startsWith('build')) {
      continue;
    }

    const controllerName = funcName.replace('build', '');
    if (!controllerName) {
      continue;
    }

    await session.run(
      `MERGE (c:Controller {name: $name, file: $file, buildFunction: $buildFunc})`,
      {
        name: controllerName,
        file: sourceFile.getFilePath(),
        buildFunc: funcName,
      }
    );
    stats.controllers++;
    console.log(`Found Controller: ${controllerName} (${funcName})`);

    const actionImports = new Set<string>();
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
      const moduleSpec = imp.getModuleSpecifierValue();
      if (
        moduleSpec.includes('/features/') &&
        moduleSpec.includes('-actions')
      ) {
        for (const named of imp.getNamedImports()) {
          actionImports.add(named.getName());
        }
      }
    }

    for (const actionName of actionImports) {
      await session.run(
        `
        MATCH (c:Controller {name: $cName})
        MERGE (a:Action {name: $aName})
        MERGE (c)-[:DISPATCHES]->(a)
        `,
        {cName: controllerName, aName: actionName}
      );
      stats.controllerActionLinks++;
      console.log(`  -> dispatches: ${actionName}`);
    }
  }
}

async function scanActions(
  sourceFile: SourceFile,
  session: neo4j.Session,
  stats: ScanStats
) {
  const fileName = sourceFile.getBaseName();
  if (
    !fileName.includes('-actions.') ||
    fileName.includes('.spec.') ||
    fileName.includes('.test.')
  ) {
    return;
  }

  const variableDeclarations = sourceFile.getVariableDeclarations();
  for (const v of variableDeclarations) {
    const initializer = v.getInitializer();
    if (!initializer) {
      continue;
    }

    const initText = initializer.getText();
    const actionName = v.getName();

    if (initText.includes('createAsyncThunk')) {
      const args = initializer.getDescendantsOfKind(SyntaxKind.StringLiteral);
      const actionType = args[0]?.getLiteralText() ?? '';

      if (actionType) {
        await session.run(
          `MERGE (a:Action {name: $name, type: $type, kind: 'async', file: $file})`,
          {name: actionName, type: actionType, file: sourceFile.getFilePath()}
        );
        stats.actions++;
        console.log(`Found AsyncAction: ${actionName} (${actionType})`);
      }
    } else if (initText.includes('createAction')) {
      const args = initializer.getDescendantsOfKind(SyntaxKind.StringLiteral);
      const actionType = args[0]?.getLiteralText() ?? '';

      if (actionType) {
        await session.run(
          `MERGE (a:Action {name: $name, type: $type, kind: 'sync', file: $file})`,
          {name: actionName, type: actionType, file: sourceFile.getFilePath()}
        );
        stats.actions++;
        console.log(`Found SyncAction: ${actionName} (${actionType})`);
      }
    }
  }
}

async function scanReducers(
  sourceFile: SourceFile,
  session: neo4j.Session,
  stats: ScanStats
) {
  const fileName = sourceFile.getBaseName();
  if (
    !fileName.includes('-slice.') ||
    fileName.includes('.spec.') ||
    fileName.includes('.test.')
  ) {
    return;
  }

  const sliceName = fileName.replace('-slice.ts', '').replace(/-/g, ' ');
  const formattedName = sliceName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  await session.run(`MERGE (r:Reducer {name: $name, file: $file})`, {
    name: formattedName,
    file: sourceFile.getFilePath(),
  });
  stats.reducers++;
  console.log(`Found Reducer: ${formattedName}`);

  const actionImports = new Map<string, string>();
  const imports = sourceFile.getImportDeclarations();
  for (const imp of imports) {
    const moduleSpec = imp.getModuleSpecifierValue();
    if (moduleSpec.includes('-actions')) {
      for (const named of imp.getNamedImports()) {
        actionImports.set(named.getName(), moduleSpec);
      }
    }
  }

  for (const [actionName] of actionImports) {
    await session.run(
      `
      MATCH (r:Reducer {name: $rName})
      MERGE (a:Action {name: $aName})
      MERGE (r)-[:HANDLES]->(a)
      `,
      {rName: formattedName, aName: actionName}
    );
    stats.reducerActionLinks++;
    console.log(`  -> handles: ${actionName}`);
  }
}

async function scanHeadless() {
  const session = driver.session();
  const project = new Project({
    tsConfigFilePath: `${process.env.REPO_ROOT}/packages/headless/tsconfig.json`,
    skipAddingFilesFromTsConfig: true,
  });

  const headlessPath = `${process.env.REPO_ROOT}/packages/headless/src/**/*.ts`;
  console.log(`Adding source files from ${headlessPath}...`);
  project.addSourceFilesAtPaths(headlessPath);

  const sourceFiles = project.getSourceFiles();
  console.log(`Scanning ${sourceFiles.length} files...\n`);

  const stats: ScanStats = {
    controllers: 0,
    actions: 0,
    reducers: 0,
    controllerActionLinks: 0,
    reducerActionLinks: 0,
  };

  console.log('=== Scanning Controllers ===');
  for (const sourceFile of sourceFiles) {
    await scanControllers(sourceFile, session, stats);
  }

  console.log('\n=== Scanning Actions ===');
  for (const sourceFile of sourceFiles) {
    await scanActions(sourceFile, session, stats);
  }

  console.log('\n=== Scanning Reducers ===');
  for (const sourceFile of sourceFiles) {
    await scanReducers(sourceFile, session, stats);
  }

  console.log('\n=== Scan Complete ===');
  console.log(`  Controllers: ${stats.controllers}`);
  console.log(`  Actions: ${stats.actions}`);
  console.log(`  Reducers: ${stats.reducers}`);
  console.log(`  Controller->Action links: ${stats.controllerActionLinks}`);
  console.log(`  Reducer->Action links: ${stats.reducerActionLinks}`);

  await session.close();
  await driver.close();
}

scanHeadless();
