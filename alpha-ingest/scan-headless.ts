import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import {
  type CallExpression,
  type Node,
  Project,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';

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
  actionDispatchLinks: number;
}

function findDispatchedActions(initializer: Node): Set<string> {
  const dispatched = new Set<string>();
  const calls = initializer.getDescendantsOfKind(SyntaxKind.CallExpression);

  for (const call of calls) {
    const expression = call.getExpression();
    const expressionText = expression.getText();
    const isDispatchCall =
      expressionText === 'dispatch' || expressionText.endsWith('.dispatch');

    if (!isDispatchCall) {
      continue;
    }

    for (const arg of call.getArguments()) {
      if (arg.getKind() === SyntaxKind.CallExpression) {
        const callee = (arg as CallExpression).getExpression().getText();
        if (callee) {
          dispatched.add(callee);
        }
      } else if (arg.getKind() === SyntaxKind.Identifier) {
        dispatched.add(arg.getText());
      }
    }
  }

  return dispatched;
}

/**
 * Detects if an action emits relay events (e.g., relay.emit('ec.purchase', ...))
 * Actions that emit relay events are not orphans - they have meaningful side effects.
 */
function hasRelayEmit(initializer: Node): boolean {
  const calls = initializer.getDescendantsOfKind(SyntaxKind.CallExpression);

  for (const call of calls) {
    const expression = call.getExpression();
    const expressionText = expression.getText();

    // Matches relay.emit(...) or similar patterns
    if (
      expressionText === 'relay.emit' ||
      expressionText.endsWith('.emit') ||
      expressionText.includes('relay')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Detects if an action only calls validatePayload and nothing else.
 * These are "true orphan" actions that don't dispatch, don't emit events,
 * and don't have any other side effects.
 */
function isValidatePayloadOnly(initializer: Node): boolean {
  const initText = initializer.getText();

  // For createAction with prepare callback, check if it only calls validatePayload
  if (initText.includes('createAction')) {
    const calls = initializer.getDescendantsOfKind(SyntaxKind.CallExpression);
    const meaningfulCalls = calls.filter((call) => {
      const expr = call.getExpression().getText();
      // Ignore createAction itself and validatePayload
      return (
        expr !== 'createAction' &&
        expr !== 'validatePayload' &&
        !expr.includes('validatePayload')
      );
    });
    return meaningfulCalls.length === 0;
  }

  return false;
}

function getControllerCategory(filePath: string): string {
  if (filePath.includes('/insight/')) return 'insight';
  if (filePath.includes('/commerce/')) return 'commerce';
  if (filePath.includes('/recommendation/')) return 'recommendation';
  if (filePath.includes('/case-assist/')) return 'case-assist';
  if (filePath.includes('/ssr/')) return 'ssr';
  return 'search';
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

  const filePath = sourceFile.getFilePath();
  const category = getControllerCategory(filePath);

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
      `MERGE (c:Controller {name: $name, category: $category})
       ON CREATE SET c.file = $file, c.buildFunction = $buildFunc
       ON MATCH SET c.file = $file, c.buildFunction = $buildFunc`,
      {
        name: controllerName,
        category,
        file: filePath,
        buildFunc: funcName,
      }
    );
    stats.controllers++;
    console.log(
      `Found Controller: ${controllerName} [${category}] (${funcName})`
    );

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
        MATCH (c:Controller {name: $cName, category: $category})
        MERGE (a:Action {name: $aName})
        MERGE (c)-[:DISPATCHES]->(a)
        `,
        {cName: controllerName, category, aName: actionName}
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
        const emitsRelay = hasRelayEmit(initializer);
        const dispatchedActions = findDispatchedActions(initializer);

        await session.run(
          `MERGE (a:Action {name: $name})
           ON CREATE SET a.type = $type, a.kind = 'async', a.file = $file, a.emitsRelay = $emitsRelay
           ON MATCH SET a.type = $type, a.kind = 'async', a.file = $file, a.emitsRelay = $emitsRelay`,
          {
            name: actionName,
            type: actionType,
            file: sourceFile.getFilePath(),
            emitsRelay,
          }
        );
        stats.actions++;
        console.log(
          `Found AsyncAction: ${actionName} (${actionType})${emitsRelay ? ' [emits relay]' : ''}`
        );

        for (const dispatchedName of dispatchedActions) {
          await session.run(
            `
            MATCH (src:Action {name: $srcName})
            MERGE (target:Action {name: $targetName})
            MERGE (src)-[:DISPATCHES]->(target)
            `,
            {srcName: actionName, targetName: dispatchedName}
          );
          stats.actionDispatchLinks++;
          console.log(`  -> dispatches action: ${dispatchedName}`);
        }
      }
    } else if (initText.includes('createAction')) {
      const args = initializer.getDescendantsOfKind(SyntaxKind.StringLiteral);
      const actionType = args[0]?.getLiteralText() ?? '';

      if (actionType) {
        const validateOnly = isValidatePayloadOnly(initializer);
        const dispatchedActions = findDispatchedActions(initializer);

        await session.run(
          `MERGE (a:Action {name: $name})
           ON CREATE SET a.type = $type, a.kind = 'sync', a.file = $file, a.validateOnly = $validateOnly
           ON MATCH SET a.type = $type, a.kind = 'sync', a.file = $file, a.validateOnly = $validateOnly`,
          {
            name: actionName,
            type: actionType,
            file: sourceFile.getFilePath(),
            validateOnly,
          }
        );
        stats.actions++;
        console.log(
          `Found SyncAction: ${actionName} (${actionType})${validateOnly ? ' [validate-only]' : ''}`
        );

        for (const dispatchedName of dispatchedActions) {
          await session.run(
            `
            MATCH (src:Action {name: $srcName})
            MERGE (target:Action {name: $targetName})
            MERGE (src)-[:DISPATCHES]->(target)
            `,
            {srcName: actionName, targetName: dispatchedName}
          );
          stats.actionDispatchLinks++;
          console.log(`  -> dispatches action: ${dispatchedName}`);
        }
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
    actionDispatchLinks: 0,
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
  console.log(`  Action->Action dispatch links: ${stats.actionDispatchLinks}`);

  await session.close();
  await driver.close();
}

scanHeadless();
