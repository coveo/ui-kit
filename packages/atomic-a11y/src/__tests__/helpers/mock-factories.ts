import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import type {
  ComponentAccumulator,
  PackageMetadata,
  StorybookTaskMeta,
} from '../../reporter/reporter-utils.js';

/**
 * Creates a minimal mock axe rule with sensible defaults.
 * @param overrides - Partial override object to customize the rule
 * @returns A mock AxeRuleResult-shaped object
 */
export function createMockAxeRule(
  overrides?: Partial<AxeRuleResult>
): AxeRuleResult {
  const id = overrides?.id ?? 'test-rule';
  const tags = overrides?.tags ?? [];
  const impact = overrides?.impact ?? 'moderate';

  return {
    id,
    tags,
    impact,
    description: overrides?.description ?? `${id} description`,
    help: overrides?.help ?? `${id} help`,
    helpUrl: overrides?.helpUrl ?? `https://example.com/${id}`,
    nodes: overrides?.nodes ?? [
      {
        all: [],
        any: [
          {
            id: `${id}-check`,
            data: null,
            impact,
            message: `${id} message`,
            relatedNodes: [],
          },
        ],
        none: [],
        html: `<div data-rule="${id}"></div>`,
        target: ['div'],
        failureSummary: `${id} failure summary`,
      },
    ],
  };
}

/**
 * Creates a minimal mock AxeResults object with empty arrays by default.
 * @param overrides - Partial override object to customize the results
 * @returns A mock AxeResults-shaped object
 */
export function createMockAxeResults(
  overrides?: Partial<AxeResults>
): AxeResults {
  return {
    violations: overrides?.violations ?? [],
    passes: overrides?.passes ?? [],
    incomplete: overrides?.incomplete ?? [],
    inapplicable: overrides?.inapplicable ?? [],
    timestamp: overrides?.timestamp ?? new Date().toISOString(),
    url: overrides?.url ?? 'http://localhost:6006/',
    testEngine: overrides?.testEngine ?? {name: 'axe-core', version: '4.10.0'},
    testRunner: overrides?.testRunner ?? {name: 'vitest'},
    testEnvironment: overrides?.testEnvironment ?? {
      userAgent: 'Mock Browser',
      windowWidth: 1024,
      windowHeight: 768,
    },
    toolOptions: overrides?.toolOptions ?? {},
  };
}

/**
 * Creates a minimal mock Vitest TestCase with Storybook metadata.
 * @param overrides - Partial override object to customize the test case
 * @returns A mock TestCase-shaped object
 */
export function createMockTestCase(overrides?: {
  id?: string;
  projectName?: string;
  moduleId?: string;
  storyId?: string;
  axeResults?: AxeResults;
}): Record<string, unknown> {
  const axeResults = overrides?.axeResults ?? createMockAxeResults();
  const storyId = overrides?.storyId ?? 'search-atomic-test--default';
  const moduleId =
    overrides?.moduleId ??
    'src/components/search/atomic-test/atomic-test.new.stories.tsx';
  const projectName = overrides?.projectName ?? 'storybook';
  const id = overrides?.id ?? `${projectName}-${storyId}`;

  return {
    id,
    project: {name: projectName},
    module: {moduleId},
    meta: (): StorybookTaskMeta => ({
      storyId,
      reports: [{type: 'a11y', result: axeResults}],
    }),
    result: {
      errors: [],
    },
  };
}

/**
 * Creates a minimal ComponentAccumulator with proper Set initialization.
 * @param overrides - Partial override object to customize the accumulator
 * @returns A mock ComponentAccumulator-shaped object
 */
export function createMockComponentAccumulator(
  overrides?: Partial<ComponentAccumulator>
): ComponentAccumulator {
  return {
    name: overrides?.name ?? 'atomic-test',
    category: overrides?.category ?? 'search',
    framework: overrides?.framework ?? 'lit',
    storyIds: overrides?.storyIds ?? new Set(['search-atomic-test--default']),
    automated: {
      violations: overrides?.automated?.violations ?? 0,
      passes: overrides?.automated?.passes ?? 0,
      incomplete: overrides?.automated?.incomplete ?? 0,
      inapplicable: overrides?.automated?.inapplicable ?? 0,
      criteriaCovered: overrides?.automated?.criteriaCovered ?? new Set(),
      incompleteDetails: overrides?.automated?.incompleteDetails ?? [],
    },
  };
}

/**
 * Creates a minimal PackageMetadata object.
 * @param overrides - Partial override object to customize the metadata
 * @returns A mock PackageMetadata-shaped object
 */
export function createMockPackageMetadata(
  overrides?: Partial<PackageMetadata>
): PackageMetadata {
  return {
    version: overrides?.version ?? '1.0.0',
    dependencies: overrides?.dependencies ?? {},
    devDependencies: overrides?.devDependencies ?? {
      'axe-core': '4.10.0',
      storybook: '8.0.0',
    },
  };
}
