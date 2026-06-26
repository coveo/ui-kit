/**
 * Test Utilities
 *
 * Common helpers and mock data builders for unit tests
 */

import {Engine, getFullEngine} from '@/src/core/index.js';
import type {SearchResult, FacetValue} from '@/src/core/index.js';
import type {
  EndpointStateScope,
  Supports,
  FacadeResolver,
} from '@/src/core/interface/utils/interface-types.js';
import {
  STATE_ID,
  ENGINE,
  KIND,
  TYPE,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';

/**
 * Create a fresh engine instance for testing
 * Ensures test isolation by providing a new engine per test
 */
export function createTestEngine(): Engine {
  return new Engine();
}

const noopResolver: FacadeResolver = (_scope: EndpointStateScope) => {
  throw new Error('No thunk registered for this facade in test');
};

/**
 * Create a mock interface handle for testing controllers that require a search-capable interface.
 * The stateId defaults to 'test'. Resolvers default to noop.
 */
export function createTestInterface(
  engine: Engine,
  stateId = 'test',
  resolvers?: {search?: FacadeResolver; suggestions?: FacadeResolver}
): Supports<'search'> {
  const fullEngine = getFullEngine(engine);
  return {
    [KIND]: 'interface' as const,
    [TYPE]: 'search' as const,
    [STATE_ID]: stateId,
    [ENGINE]: fullEngine,
    [FACADE_RESOLVERS]: {
      search: resolvers?.search ?? noopResolver,
      suggestions: resolvers?.suggestions ?? noopResolver,
    },
  };
}

/**
 * Mock search result builder
 */
export function createMockSearchResult(
  overrides?: Partial<SearchResult>
): SearchResult {
  return {
    uniqueId: 'result-1',
    title: 'Test Result',
    uri: 'https://example.com/doc',
    excerpt: 'This is a test excerpt...',
    printableUri: 'https://example.com/doc',
    clickUri: 'https://example.com/doc',
    raw: {},
    score: 0,
    ...overrides,
  };
}

/**
 * Create multiple mock search results
 */
export function createMockSearchResults(count: number): SearchResult[] {
  return Array.from({length: count}, (_, i) =>
    createMockSearchResult({
      uniqueId: `result-${i + 1}`,
      title: `Test Result ${i + 1}`,
      uri: `https://example.com/doc-${i + 1}`,
      excerpt: `This is test excerpt ${i + 1}...`,
    })
  );
}

/**
 * Mock facet value builder
 */
export function createMockFacetValue(
  overrides?: Partial<FacetValue>
): FacetValue {
  return {
    id: 'test-value',
    label: 'Test Value',
    count: 10,
    ...overrides,
  };
}

/**
 * Create multiple mock facet values
 */
export function createMockFacetValues(count: number): FacetValue[] {
  return Array.from({length: count}, (_, i) =>
    createMockFacetValue({
      id: `value-${i + 1}`,
      label: `Value ${i + 1}`,
      count: 10 - i,
    })
  );
}

/**
 * Wait for next tick (useful for async operations)
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
