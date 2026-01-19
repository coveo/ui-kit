#!/usr/bin/env node
/**
 * Generate the ui-kit knowledge graph by scanning the monorepo
 *
 * Usage: pnpm generate [--output <path>]
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {glob} from 'glob';

// L3: Domain configuration
import {
  actionGlob,
  componentControllerLinking,
  componentGlob,
  componentIgnore,
  controllerActionLinking,
  controllerConfig,
  createSimpleEntityExtractor,
  extractActionsFromFile,
  extractComponentsFromFile,
  extractReducerFromFile,
  extractStoryNames,
  extractTestFromPath,
  generateActionCacheKeys,
  generateComponentCacheKeys,
  generateControllerCacheKeys,
  generateReducerCacheKeys,
  getPackageFromPath,
  reducerActionLinking,
  reducerGlob,
  resolveSourcePath,
  shouldSkipController,
  simpleEntityConfigs,
  storyComponentLinking,
  storyEngineLinking,
  storyGlob,
  testGlob,
} from '../config/index.js';
// L1: Core primitives
import {EntityCache, GraphBuilder} from '../core/index.js';
// Generic relationship linker
import {linkEntitiesByFileAnalysis} from '../core/relationship-linker.js';
// L2: TypeScript utilities
import {parseDtsExports, readFile, scanFiles} from '../parsers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const OUTPUT_FILE =
  outputIndex >= 0 && args[outputIndex + 1]
    ? path.resolve(args[outputIndex + 1])
    : path.join(__dirname, '../../../../ui-kit-graph.json');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

// Initialize L1 primitives
const graphBuilder = new GraphBuilder();
const nodeCache = new EntityCache();

/**
 * Get relative path from project root
 */
function getRelativePath(fullPath: string): string {
  return path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');
}

/**
 * Helper: Create node using L1 primitive
 */
function createNode(labels: string[], properties: Record<string, unknown>) {
  return graphBuilder.createNode(labels, properties);
}

/**
 * Helper: Create relationship using L1 primitive
 */
function createRelationship(start: number, end: number, type: string) {
  return graphBuilder.createRelationship(start, end, type);
}

// Extract simple entities using L3 factory
const extractInstructions = createSimpleEntityExtractor(
  simpleEntityConfigs.Instruction,
  PROJECT_ROOT,
  nodeCache,
  createNode,
  createRelationship
);

const extractSkills = createSimpleEntityExtractor(
  simpleEntityConfigs.Skill,
  PROJECT_ROOT,
  nodeCache,
  createNode,
  createRelationship
);

const extractAgents = createSimpleEntityExtractor(
  simpleEntityConfigs.Agent,
  PROJECT_ROOT,
  nodeCache,
  createNode,
  createRelationship
);

const extractPrompts = createSimpleEntityExtractor(
  simpleEntityConfigs.Prompt,
  PROJECT_ROOT,
  nodeCache,
  createNode,
  createRelationship
);

/**
 * Extract packages from package.json files
 */
async function extractPackages(): Promise<void> {
  console.log('📦 Extracting packages...');

  const packageFiles = await glob('packages/*/package.json', {
    cwd: PROJECT_ROOT,
  });

  for (const pkgPath of packageFiles) {
    const fullPath = path.join(PROJECT_ROOT, pkgPath);
    const pkgDir = path.dirname(pkgPath);
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

    const packageId = createNode(['Package'], {
      name: pkg.name || path.basename(pkgDir),
      path: pkgDir,
      version: pkg.version || '0.0.0',
      description: pkg.description || '',
    });

    // Cache with multiple keys (useful for lookups)
    nodeCache.set(`package:${pkg.name}`, packageId);
    nodeCache.set(`package:${pkgDir}`, packageId);

    // Extract dependencies
    const deps = {...pkg.dependencies, ...pkg.devDependencies};
    for (const depName of Object.keys(deps)) {
      // Only link to internal packages (starting with @coveo/)
      if (depName.startsWith('@coveo/')) {
        const depId = nodeCache.get(`package:${depName}`);
        if (depId) {
          createRelationship(packageId, depId, 'DEPENDS_ON');
        }
      }
    }
  }

  console.log(`  ✓ Found ${packageFiles.length} packages`);
}

/**
 * Extract all source files (not tests or stories)
 */
async function extractFiles(): Promise<void> {
  console.log('📄 Extracting files...');

  // Extract regular source files
  const sourceFiles = await glob('packages/**/*.{ts,tsx,js,jsx}', {
    cwd: PROJECT_ROOT,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-*/**',
      '**/cdn/**',
      '**/build/**',
      '**/.turbo/**',
      '**/*.spec.*',
      '**/*.test.*',
    ],
  });

  // Also include controller type definitions from dist/definitions
  const dtsFiles = await glob('packages/headless/dist/definitions/**/*.d.ts', {
    cwd: PROJECT_ROOT,
  });

  const files = [...sourceFiles, ...dtsFiles];

  for (const filePath of files) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const relativePath = getRelativePath(fullPath);

    const ext = path.extname(filePath);
    const name = path.basename(filePath);

    let fileType = 'source';
    let labels = ['File', 'SourceFile'];

    // Determine file type
    if (name.includes('.spec.') || name.includes('.test.')) {
      fileType = 'test';
      labels = ['File', 'TestFile'];
    } else if (name.includes('.stories.')) {
      fileType = 'story';
      labels = ['File', 'StoryFile'];
    } else if (
      name.includes('.config.') ||
      name.endsWith('rc.js') ||
      name.endsWith('rc.ts')
    ) {
      fileType = 'config';
      labels = ['File', 'ConfigFile'];
    }

    const stats = fs.statSync(fullPath);

    const fileId = createNode(labels, {
      path: relativePath,
      name,
      extension: ext,
      size: stats.size,
      type: fileType,
    });

    nodeCache.set(`file:${relativePath}`, fileId);

    // Link file to package
    const packagePath = relativePath.match(/^packages\/[^/]+/)?.[0];
    if (packagePath) {
      const packageId = nodeCache.get(`package:${packagePath}`);
      if (packageId) {
        createRelationship(packageId, fileId, 'CONTAINS');
      }
    }
  }

  console.log(`  ✓ Found ${files.length} source files`);
}

/**
 * Extract test files
 */
async function extractTests(): Promise<void> {
  console.log('🧪 Extracting test files...');

  const testFiles = await glob(testGlob, {cwd: PROJECT_ROOT});

  for (const testPath of testFiles) {
    const fullPath = path.join(PROJECT_ROOT, testPath);
    const relativePath = getRelativePath(fullPath);
    const name = path.basename(testPath);

    // Extract test entity using L3 rules
    const testData = extractTestFromPath(relativePath, name);
    const testId = createNode(testData.labels, testData.properties);

    nodeCache.set(`test:${relativePath}`, testId);

    // Try to find corresponding source file using L3 transformation rules
    const sourcePath = resolveSourcePath(relativePath);
    const sourceId = nodeCache.get(`file:${sourcePath}`);
    if (sourceId) {
      createRelationship(testId, sourceId, 'TESTS');
    }
  }

  console.log(`  ✓ Found ${testFiles.length} test files`);
}

/**
 * Extract Atomic components from file content
 */
async function extractComponents(): Promise<void> {
  console.log('⚛️  Extracting components...');

  // Scan component files using L3 config
  const atomicFiles = await scanFiles(componentGlob, {
    cwd: PROJECT_ROOT,
    ignore: componentIgnore,
  });

  let componentCount = 0;

  for (const filePath of atomicFiles) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const relativePath = getRelativePath(fullPath);

    // Extract components using L3 rules
    const components = extractComponentsFromFile(fullPath, relativePath);

    for (const componentData of components) {
      // Create node using L1 primitives
      const componentId = createNode(
        componentData.labels,
        componentData.properties
      );

      // Generate cache keys using L3 rules
      const cacheKeys = generateComponentCacheKeys(componentData);
      nodeCache.set(cacheKeys, componentId);

      // Link to source file
      const fileId = nodeCache.get(`file:${relativePath}`);
      if (fileId) {
        createRelationship(fileId, componentId, 'EXPORTS');
      }

      componentCount++;
    }
  }

  console.log(`  ✓ Found ${componentCount} components`);
}

/**
 * Extract controllers and their relationships with components
 */
async function extractControllers(): Promise<void> {
  console.log('🎮 Extracting controllers...');

  // Scan .d.ts files using L2 utilities
  const dtsFiles = await scanFiles(controllerConfig.dtsGlob, {
    cwd: PROJECT_ROOT,
    ignore: controllerConfig.dtsIgnore,
  });

  let controllerCount = 0;

  for (const filePath of dtsFiles) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const relativePath = getRelativePath(fullPath);
    const content = readFile(fullPath);

    // Parse .d.ts exports using L2 utilities
    const exports = parseDtsExports(content);

    for (const match of exports) {
      // Apply L3 filtering rules
      if (shouldSkipController(match.buildFunction, match.returnType)) {
        continue;
      }

      // Determine package using L3 rules
      const packageType = getPackageFromPath(relativePath);

      // Create node using L1 primitives
      const controllerId = createNode(
        controllerConfig.nodeLabels,
        controllerConfig.nodeProperties(match, relativePath, packageType)
      );

      // Generate cache keys using L3 rules
      const cacheKeys = generateControllerCacheKeys(
        match.returnType,
        match.buildFunction,
        packageType
      );

      // Cache with all keys
      nodeCache.set(cacheKeys, controllerId);

      // Link to source file
      const fileId = nodeCache.get(`file:${relativePath}`);
      if (fileId) {
        createRelationship(fileId, controllerId, 'EXPORTS');
      }

      controllerCount++;
    }
  }

  console.log(`  ✓ Found ${controllerCount} controllers`);

  // Now link components to controllers they use
  console.log('🔗 Linking components to controllers...');

  // Link components to controllers using generic linker
  console.log('  🔗 Linking components to controllers...');

  const componentFiles = await scanFiles(
    componentControllerLinking.componentGlob,
    {
      cwd: PROJECT_ROOT,
      ignore: componentControllerLinking.componentIgnore,
    }
  );

  const linkCount = linkEntitiesByFileAnalysis({
    sourceFiles: componentFiles.map((f) => path.join(PROJECT_ROOT, f)),
    cache: nodeCache,
    getSourceId: (filePath) =>
      componentControllerLinking.getSourceId(filePath, nodeCache),
    extractReferences: (filePath) =>
      componentControllerLinking.extractReferences(filePath, PROJECT_ROOT),
    generateTargetKeys: (reference) =>
      componentControllerLinking.generateTargetKeys(reference),
    createRelationship: (sourceId, targetId, label) =>
      createRelationship(sourceId, targetId, label),
    relationshipLabel: componentControllerLinking.relationshipLabel,
  });

  console.log(`  ✓ Created ${linkCount} component-controller relationships`);
}

/**
 * Extract Redux actions from action files
 */
async function extractActions(): Promise<void> {
  console.log('⚡ Extracting actions...');

  // Scan action files using L3 config
  const actionFiles = await scanFiles(actionGlob, {cwd: PROJECT_ROOT});

  let actionCount = 0;

  for (const filePath of actionFiles) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const relativePath = getRelativePath(fullPath);

    // Extract actions using L3 rules
    const actions = extractActionsFromFile(fullPath, relativePath);

    for (const actionData of actions) {
      // Create node using L1 primitives
      const actionId = createNode(actionData.labels, actionData.properties);

      // Generate cache keys using L3 rules
      const cacheKeys = generateActionCacheKeys(actionData);
      nodeCache.set(cacheKeys, actionId);

      // Link to source file
      const fileId = nodeCache.get(`file:${relativePath}`);
      if (fileId) {
        createRelationship(fileId, actionId, 'EXPORTS');
      }

      actionCount++;
    }
  }

  console.log(`  ✓ Found ${actionCount} actions`);
}

/**
 * Extract Redux reducers from slice files
 */
async function extractReducers(): Promise<void> {
  console.log('🔄 Extracting reducers...');

  // Scan reducer slice files using L3 config
  const sliceFiles = await scanFiles(reducerGlob, {cwd: PROJECT_ROOT});

  let reducerCount = 0;

  for (const filePath of sliceFiles) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const relativePath = getRelativePath(fullPath);

    // Extract reducer using L3 rules
    const reducerData = extractReducerFromFile(fullPath, relativePath);

    if (reducerData) {
      // Create node using L1 primitives
      const reducerId = createNode(reducerData.labels, reducerData.properties);

      // Generate cache keys using L3 rules
      const cacheKeys = generateReducerCacheKeys(reducerData);
      nodeCache.set(cacheKeys, reducerId);

      // Link to source file
      const fileId = nodeCache.get(`file:${relativePath}`);
      if (fileId) {
        createRelationship(fileId, reducerId, 'EXPORTS');
      }

      reducerCount++;
    }
  }

  console.log(`  ✓ Found ${reducerCount} reducers`);

  // Link reducers to actions they handle using generic linker
  console.log('  🔗 Linking reducers to actions...');

  const linkCount = linkEntitiesByFileAnalysis({
    sourceFiles: sliceFiles.map((f) => path.join(PROJECT_ROOT, f)),
    cache: nodeCache,
    getSourceId: (filePath) =>
      reducerActionLinking.getSourceId(filePath, nodeCache),
    extractReferences: (filePath) =>
      reducerActionLinking.extractReferences(filePath),
    generateTargetKeys: (reference) =>
      reducerActionLinking.generateTargetKeys(reference),
    createRelationship: (sourceId, targetId, label) =>
      createRelationship(sourceId, targetId, label),
    relationshipLabel: reducerActionLinking.relationshipLabel,
  });

  console.log(`  ✓ Created ${linkCount} reducer-action relationships`);
}

/**
 * Link controllers to actions they dispatch
 */
async function linkControllersToActions(): Promise<void> {
  console.log('🔗 Linking controllers to actions...');

  const controllerFiles = await scanFiles(
    controllerActionLinking.controllerGlob,
    {
      cwd: PROJECT_ROOT,
      ignore: controllerActionLinking.controllerIgnore,
    }
  );

  const linkCount = linkEntitiesByFileAnalysis({
    sourceFiles: controllerFiles.map((f) => path.join(PROJECT_ROOT, f)),
    cache: nodeCache,
    getSourceId: (filePath) =>
      controllerActionLinking.getSourceId(filePath, nodeCache),
    extractReferences: (filePath) =>
      controllerActionLinking.extractReferences(filePath),
    generateTargetKeys: (reference) =>
      controllerActionLinking.generateTargetKeys(reference),
    createRelationship: (sourceId, targetId, label) =>
      createRelationship(sourceId, targetId, label),
    relationshipLabel: controllerActionLinking.relationshipLabel,
  });

  console.log(`  ✓ Created ${linkCount} controller-action relationships`);
}

/**
 * Extract search engines and their configurations
 */
async function extractEngines(): Promise<void> {
  console.log('🔧 Extracting engines...');

  // Define known engines and their default reducers
  const engines = [
    {
      name: 'SearchEngine',
      package: 'search',
      buildFunction: 'buildSearchEngine',
      defaultReducers: ['debug', 'pipeline', 'searchHub', 'search'],
      filePath: 'packages/headless/src/app/search-engine/search-engine.ts',
    },
    {
      name: 'CommerceEngine',
      package: 'commerce',
      buildFunction: 'buildCommerceEngine',
      defaultReducers: ['configuration', 'commerceContext', 'version'],
      filePath: 'packages/headless/src/app/commerce-engine/commerce-engine.ts',
    },
    {
      name: 'RecommendationEngine',
      package: 'recommendation',
      buildFunction: 'buildRecommendationEngine',
      defaultReducers: ['configuration', 'recommendation'],
      filePath:
        'packages/headless/src/app/recommendation-engine/recommendation-engine.ts',
    },
  ];

  for (const engine of engines) {
    const engineId = createNode(['Engine'], {
      name: engine.name,
      package: engine.package,
      buildFunction: engine.buildFunction,
      filePath: engine.filePath,
    });

    nodeCache.set(`engine:${engine.name}`, engineId);
    nodeCache.set(`engine:${engine.package}`, engineId);

    // Link to source file
    const fileId = nodeCache.get(`file:${engine.filePath}`);
    if (fileId) {
      createRelationship(fileId, engineId, 'EXPORTS');
    }

    // Link engine to its default reducers
    for (const reducerName of engine.defaultReducers) {
      // Find reducer in any feature
      const reducerId =
        nodeCache.get(`reducer:${reducerName}Reducer`) ||
        nodeCache.get(`reducer:${reducerName}`);
      if (reducerId) {
        createRelationship(engineId, reducerId, 'LOADS_BY_DEFAULT');
      }
    }
  }

  console.log(`  ✓ Found ${engines.length} engines`);
}

async function extractStories(): Promise<void> {
  console.log('📖 Extracting Storybook stories...');

  const storyFiles = await glob(storyGlob, {cwd: PROJECT_ROOT});

  let storyCount = 0;
  const storyEntries: Array<{filePath: string; storyName: string}> = []; // Track {filePath, storyName} for linking

  for (const filePath of storyFiles) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const relativePath = getRelativePath(fullPath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Extract the main component from file name using L3 rules
    const mainComponent =
      storyComponentLinking.getMainComponentFromPath(fullPath);

    // Extract individual story exports using L3 rules
    const storyNames = extractStoryNames(content);

    for (const storyName of storyNames) {
      const storyId = createNode(['Story'], {
        name: storyName,
        component: mainComponent,
        path: relativePath,
      });

      nodeCache.set(`story:${relativePath}:${storyName}`, storyId);

      // Link to file
      const fileId = nodeCache.get(`file:${relativePath}`);
      if (fileId) {
        createRelationship(fileId, storyId, 'CONTAINS');
      }

      storyCount++;
      storyEntries.push({filePath: fullPath, storyName});
    }
  }

  console.log(`  ✓ Found ${storyCount} stories`);

  // Link stories to components they render
  console.log('  🔗 Linking stories to components...');

  let componentLinkCount = 0;
  for (const {filePath, storyName} of storyEntries) {
    const storyId = storyComponentLinking.getSourceId(
      filePath,
      storyName,
      nodeCache
    );
    if (!storyId) continue;

    const components = storyComponentLinking.extractReferences(
      filePath,
      storyName
    );
    const seenComponents = new Set<number>();

    for (const componentRef of components) {
      const targetKeys = storyComponentLinking.generateTargetKeys(componentRef);
      let componentId: number | undefined;

      for (const key of targetKeys) {
        componentId = nodeCache.get(key);
        if (componentId) break;
      }

      if (componentId && !seenComponents.has(componentId)) {
        createRelationship(
          storyId,
          componentId,
          storyComponentLinking.relationshipLabel
        );
        seenComponents.add(componentId);
        componentLinkCount++;
      }
    }
  }

  console.log(
    `  ✓ Created ${componentLinkCount} story-component relationships`
  );

  // Link stories to engines they use
  console.log('  🔗 Linking stories to engines...');

  let engineLinkCount = 0;
  for (const {filePath, storyName} of storyEntries) {
    const storyId = storyEngineLinking.getSourceId(
      filePath,
      storyName,
      nodeCache
    );
    if (!storyId) continue;

    const engines = storyEngineLinking.extractReferences(filePath);

    for (const engineRef of engines) {
      const targetKeys = storyEngineLinking.generateTargetKeys(engineRef);
      let engineId = null;

      for (const key of targetKeys) {
        engineId = nodeCache.get(key);
        if (engineId) break;
      }

      if (engineId) {
        createRelationship(
          storyId,
          engineId,
          storyEngineLinking.relationshipLabel
        );
        engineLinkCount++;
        break; // Only one engine per story
      }
    }
  }

  console.log(`  ✓ Created ${engineLinkCount} story-engine relationships`);
}

async function main() {
  console.log('🚀 Starting knowledge graph generation...\n');

  try {
    await extractPackages();
    await extractFiles();
    await extractTests();
    await extractComponents();
    await extractControllers();
    await extractActions();
    await extractReducers();
    await extractEngines();
    await extractStories();
    await linkControllersToActions();
    await extractInstructions();
    await extractSkills();
    await extractAgents();
    await extractPrompts();

    // Get complete graph from builder
    const graphData = graphBuilder.getGraph();
    const stats = graphBuilder.getStats();

    // Write output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graphData, null, 2));

    console.log('\n✅ Knowledge graph generated successfully!');
    console.log(`   Nodes: ${stats.nodes}`);
    console.log(`   Relationships: ${stats.relationships}`);
    console.log(`   Output: ${OUTPUT_FILE}`);

    console.log('\n📝 Next steps:');
    console.log(
      '   1. Start Memgraph: docker run -p 7687:7687 -p 7444:7444 memgraph/memgraph-mage'
    );
    console.log('   2. Open Memgraph Lab: http://localhost:7444');
    console.log('   3. Import data:');
    console.log(
      `      CALL json_util.load_from_path("${OUTPUT_FILE}") YIELD objects`
    );
    console.log('      UNWIND objects AS obj');
    console.log('      WITH obj WHERE obj.type = "node"');
    if (graphData.length > 0 && graphData[0].type === 'node') {
      console.log(
        '      CREATE (n) SET n = obj.properties, n:' + graphData[0].labels[0]
      );
    }
  } catch (error) {
    console.error('❌ Error generating knowledge graph:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
