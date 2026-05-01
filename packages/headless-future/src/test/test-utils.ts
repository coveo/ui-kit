/**
 * Test Utilities
 *
 * Common helpers and mock data builders for unit tests
 */

import {vi} from 'vitest';
import {Engine} from '../core/interface/engine/engine.js';
import type {
  SearchResult,
  FacetValue,
} from '../core/interface/interface-types.js';

/**
 * Create a fresh engine instance for testing
 * Ensures test isolation by providing a new engine per test
 */
export function createTestEngine(): Engine {
  return new Engine();
}

/**
 * Mock search result builder
 */
export function createMockSearchResult(
  overrides?: Partial<SearchResult>
): SearchResult {
  return {
    id: 'result-1',
    title: 'Test Result',
    uri: 'https://example.com/doc',
    excerpt: 'This is a test excerpt...',
    ...overrides,
  };
}

/**
 * Create multiple mock search results
 */
export function createMockSearchResults(count: number): SearchResult[] {
  return Array.from({length: count}, (_, i) =>
    createMockSearchResult({
      id: `result-${i + 1}`,
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

/**
 * Create a mock Engine for testing controller/integration logic
 * Returns the engine mock and individual spy functions for assertions
 */
export function createMockEngine(): {
  engine: Engine;
  adoptSliceSpy: ReturnType<typeof vi.fn>;
  readSpy: ReturnType<typeof vi.fn>;
  subscribeSpy: ReturnType<typeof vi.fn>;
} {
  const adoptSliceSpy = vi.fn();
  const readSpy = vi.fn();
  const subscribeSpy = vi.fn();

  const engine = {
    adoptSlice: adoptSliceSpy,
    read: readSpy,
    subscribe: subscribeSpy,
  } as unknown as Engine;

  return {
    engine,
    adoptSliceSpy,
    readSpy,
    subscribeSpy,
  };
}
