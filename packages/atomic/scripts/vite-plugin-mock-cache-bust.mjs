/**
 * Vite plugin to handle browser caching issues with mocked modules in Vitest.
 *
 * The plugin operates in two phases:
 *
 * **Pre-phase (enforce: 'pre'):**
 * - Scans test files to identify modules that are mocked using vi.mock() or vi.mocked()
 * - Builds a registry mapping test files to their mocked module paths
 *
 * **Post-phase (enforce: 'post'):**
 * - For test files that mock a module: Rewrites imports to add unique query parameters
 * - For test files that don't mock the module: Leaves imports unchanged
 * - Ensures each test file gets its own cached version of mocked modules
 *
 * This prevents browser caching issues where mocked modules interfere between tests.
 *
 * Debug logging can be enabled by setting DEBUG=vite-plugin-mock-cache-bust:*
 */

import crypto from 'node:crypto';
import debugFactory from 'debug';

// Create debug instances for different parts of the plugin
const debugPre = debugFactory('vite-plugin-mock-cache-bust:pre');
const debugPost = debugFactory('vite-plugin-mock-cache-bust:post');
const debugExtract = debugFactory('vite-plugin-mock-cache-bust:extract');
const debugRewrite = debugFactory('vite-plugin-mock-cache-bust:rewrite');

/**
 * Creates the mock cache bust plugin with pre and post phase instances.
 * @returns {[Object, Object]} Array of two plugin instances [prePhase, postPhase]
 */
export function mockCacheBustPlugin() {
  // Shared state between pre and post phases
  // Maps test file paths to their mocked module paths
  const mockedModulesMap = new Map(); // Map<testFilePath, Set<mockedModulePath>>

  // Maps test file paths to their unique IDs
  const testFileIds = new Map(); // Map<testFilePath, string>

  /**
   * Pre-phase plugin: Scans test files for vi.mock() and vi.mocked() calls
   */
  const prePhasePlugin = {
    name: 'mock-cache-bust:pre',
    enforce: 'pre',

    /**
     * Transform phase - scan test files for mocked modules
     */
    transform(code, id) {
      // Only process .spec.ts files
      if (!id.includes('.spec.ts')) {
        return null;
      }

      debugPre(`Processing test file: ${id}`);

      try {
        // Parse the code to find vi.mock() and vi.mocked() calls
        const mockedModules = extractMockedModules(code);

        debugPre(
          `Found ${mockedModules.size} mocked modules:`,
          Array.from(mockedModules)
        );

        if (mockedModules.size > 0) {
          mockedModulesMap.set(id, mockedModules);

          // Generate a unique ID for this test file if not already present
          if (!testFileIds.has(id)) {
            const uniqueId = generateUniqueId(id);
            testFileIds.set(id, uniqueId);
            debugPre(`Generated unique ID for ${id}: ${uniqueId}`);
          }
        }
      } catch (error) {
        // If parsing fails, just skip this file
        debugPre(`Failed to parse ${id}: ${error.message}`);
      }

      // Don't modify the code in pre-phase, just collect information
      return null;
    },
  };

  /**
   * Post-phase plugin: Rewrites imports to add query parameters for mocked modules
   */
  const postPhasePlugin = {
    name: 'mock-cache-bust:post',
    enforce: 'post',

    /**
     * Transform phase - rewrite imports in test files that mock modules
     */
    transform(code, id) {
      // Only process .spec.ts files
      if (!id.includes('.spec.ts')) {
        return null;
      }

      debugPost(`Processing test file: ${id}`);

      // Check if this test file has any mocked modules
      const mockedModules = mockedModulesMap.get(id);
      if (!mockedModules || mockedModules.size === 0) {
        debugPost(`No mocked modules found for ${id}, skipping`);
        return null;
      }

      // Get the unique ID for this test file
      const uniqueId = testFileIds.get(id);
      if (!uniqueId) {
        debugPost(`No unique ID found for ${id}, skipping`);
        return null;
      }

      debugPost(
        `Rewriting imports for ${mockedModules.size} mocked modules with ID: ${uniqueId}`
      );

      try {
        // Rewrite imports to add query parameters for mocked modules
        const transformedCode = rewriteImports(code, mockedModules, uniqueId);

        if (transformedCode !== code) {
          debugPost(`Successfully transformed imports in ${id}`);
          return {
            code: transformedCode,
            map: null,
          };
        } else {
          debugPost(`No imports to transform in ${id}`);
        }
      } catch (error) {
        debugPost(`Failed to transform ${id}: ${error.message}`);
      }

      return null;
    },
  };

  return [prePhasePlugin, postPhasePlugin];
}

/**
 * Extracts mocked module paths from test file code using regex.
 * Looks for patterns like:
 * - vi.mock('module-path', ...)
 * - vi.mocked(importName)
 *
 * @param {string} code - The source code to analyze
 * @returns {Set<string>} Set of mocked module paths
 */
function extractMockedModules(code) {
  const mockedModules = new Set();
  debugExtract('Analyzing code for mocked modules...');

  // Pattern 1: vi.mock('module-path') or vi.mock("module-path")
  // Matches: vi.mock('path', ...) or vi.mock("path", ...)
  const viMockRegex = /vi\.mock\s*\(\s*['"]([^'"]+)['"]/g;
  let match = viMockRegex.exec(code);
  while (match !== null) {
    debugExtract(`Found vi.mock() call for: ${match[1]}`);
    mockedModules.add(match[1]);
    match = viMockRegex.exec(code);
  }

  // Pattern 2: vi.mocked(importName)
  // First, we need to build a map of imports to their module paths
  const importMap = buildImportMap(code);
  debugExtract('Built import map:', Object.fromEntries(importMap));

  // Find all vi.mocked() calls
  const viMockedRegex =
    /vi\.mocked\s*\(\s*([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\s*\)/g;
  match = viMockedRegex.exec(code);
  while (match !== null) {
    const identifierChain = match[1];
    // Get the root identifier (first part before any dots)
    const rootIdentifier = identifierChain.split('.')[0];
    debugExtract(
      `Found vi.mocked() call for identifier: ${identifierChain} (root: ${rootIdentifier})`
    );

    // Look up the module path for this identifier
    const modulePath = importMap.get(rootIdentifier);
    if (modulePath) {
      debugExtract(`Resolved ${rootIdentifier} to module: ${modulePath}`);
      mockedModules.add(modulePath);
    } else {
      debugExtract(
        `Could not resolve module path for identifier: ${rootIdentifier}`
      );
    }
    match = viMockedRegex.exec(code);
  }

  return mockedModules;
}

/**
 * Builds a map of imported identifiers to their module paths.
 *
 * @param {string} code - The source code
 * @returns {Map<string, string>} Map from identifier to module path
 */
function buildImportMap(code) {
  const importMap = new Map();

  // Match various import patterns:
  // import foo from 'module'
  // import * as foo from 'module'
  // import { foo } from 'module'
  // import { foo as bar } from 'module'
  // import foo, { bar } from 'module'

  // This regex matches the entire import statement
  const importRegex =
    /import\s+(?:type\s+)?(?:(?:([\w$]+)|(?:\*\s+as\s+([\w$]+))|(?:\{([^}]+)\}))\s+from\s+)?['"]([^'"]+)['"]/g;

  let match = importRegex.exec(code);
  while (match !== null) {
    const [, defaultImport, namespaceImport, namedImports, modulePath] = match;

    // Default import: import foo from 'module'
    if (defaultImport) {
      importMap.set(defaultImport, modulePath);
    }

    // Namespace import: import * as foo from 'module'
    if (namespaceImport) {
      importMap.set(namespaceImport, modulePath);
    }

    // Named imports: import { foo, bar as baz } from 'module'
    if (namedImports) {
      // Split by comma and extract identifiers
      const imports = namedImports.split(',');
      for (const imp of imports) {
        const trimmed = imp.trim();
        // Handle 'foo as bar' or just 'foo'
        const asMatch = /^([\w$]+)(?:\s+as\s+([\w$]+))?$/.exec(trimmed);
        if (asMatch) {
          const localName = asMatch[2] || asMatch[1];
          importMap.set(localName, modulePath);
        }
      }
    }
    match = importRegex.exec(code);
  }

  return importMap;
}

/**
 * Rewrites import statements to add query parameters for mocked modules.
 *
 * @param {string} code - The source code
 * @param {Set<string>} mockedModules - Set of module paths that are mocked
 * @param {string} uniqueId - Unique ID for this test file
 * @returns {string} Transformed code
 */
function rewriteImports(code, mockedModules, uniqueId) {
  let transformedCode = code;

  // Create a regex to match import statements
  // This handles: import ... from 'module-path' or import ... from "module-path"
  const importRegex =
    /import\s+(?:type\s+)?(?:(?:[\w*\s{},]*)\s+from\s+)?(['"])([^'"]+)\1/g;

  transformedCode = transformedCode.replace(
    importRegex,
    (match, _quote, modulePath) => {
      // Check if this module is mocked
      if (mockedModules.has(modulePath)) {
        // Add query parameter with unique ID
        const separator = modulePath.includes('?') ? '&' : '?';
        const newModulePath = `${modulePath}${separator}mock=${uniqueId}`;
        debugRewrite(`Transforming import: ${modulePath} -> ${newModulePath}`);
        return match.replace(modulePath, newModulePath);
      }
      return match;
    }
  );

  return transformedCode;
}

/**
 * Generates a unique ID based on the file path.
 *
 * @param {string} filePath - The file path
 * @returns {string} A short unique ID
 */
function generateUniqueId(filePath) {
  const hash = crypto.createHash('md5').update(filePath).digest('hex');
  return hash.substring(0, 8);
}
