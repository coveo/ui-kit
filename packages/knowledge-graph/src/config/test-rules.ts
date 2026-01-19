/**
 * Layer 3: Domain-specific rules for test file extraction
 *
 * This module encapsulates ui-kit-specific knowledge about:
 * - Test file patterns and locations
 * - Framework detection (Vitest, Playwright, Cypress)
 * - Test type classification (unit vs E2E)
 * - Source file resolution patterns
 */

export type TestFramework = 'vitest' | 'playwright' | 'cypress' | 'unknown';
export type TestType = 'UnitTest' | 'E2ETest';

export interface TestFrameworkDetection {
  framework: TestFramework;
  testType: TestType;
}

export interface TestEntityData {
  labels: string[];
  properties: {
    path: string;
    name: string;
    framework: TestFramework;
  };
}

/**
 * Test file glob patterns
 */
export const testGlob = [
  'packages/**/*.spec.{ts,tsx,js}',
  'packages/**/*.test.{ts,tsx,js}',
  'packages/**/*.e2e.{ts,tsx}',
];

/**
 * Test framework detection rules
 */
interface FrameworkDetectionRule {
  pattern: RegExp;
  framework: TestFramework;
  testType: TestType;
}

const frameworkDetectionRules: FrameworkDetectionRule[] = [
  {
    pattern: /\.e2e\./,
    framework: 'playwright',
    testType: 'E2ETest',
  },
  {
    pattern: /cypress\//,
    framework: 'cypress',
    testType: 'E2ETest',
  },
  {
    pattern: /\.(spec|test)\./,
    framework: 'vitest',
    testType: 'UnitTest',
  },
];

/**
 * Detect test framework and type from file path
 */
export function detectTestFramework(testPath: string): TestFrameworkDetection {
  for (const rule of frameworkDetectionRules) {
    if (rule.pattern.test(testPath)) {
      return {
        framework: rule.framework,
        testType: rule.testType,
      };
    }
  }

  return {
    framework: 'unknown',
    testType: 'UnitTest',
  };
}

/**
 * Resolve source file path from test file path
 *
 * Applies transformation rules to convert test file paths to source file paths:
 * - .spec.ts → .ts
 * - .test.tsx → .tsx
 * - .e2e.ts → .ts
 */
export function resolveSourcePath(testPath: string): string {
  return testPath
    .replace(/\.spec\.(ts|tsx|js)$/, '.$1')
    .replace(/\.test\.(ts|tsx|js)$/, '.$1')
    .replace(/\.e2e\.(ts|tsx)$/, '.$1');
}

/**
 * Extract test entity data from file path
 */
export function extractTestFromPath(
  testPath: string,
  name: string
): TestEntityData {
  const {framework, testType} = detectTestFramework(testPath);

  return {
    labels: ['Test', testType],
    properties: {
      path: testPath,
      name,
      framework,
    },
  };
}
