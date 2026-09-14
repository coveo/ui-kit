/**
 * Test Utilities
 *
 * Common helpers and mock data builders for unit tests
 */

import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import type {FacetValue} from '@/src/internal/features/facets/index.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/index.js';
import type {CommerceInterface} from '@/src/internal/utils/index.js';

/**
 * Create a fresh engine instance for testing
 * Ensures test isolation by providing a new engine per test
 */
export function createTestEngine(): Engine {
  return new Engine();
}

/**
 * Create a mock interface handle for testing controllers and slices that
 * require a search-capable interface. The stateId defaults to 'test'.
 */
export function createTestInterface(engine: Engine, stateId = 'test'): CommerceInterface {
  return new CommerceInterfaceImpl(getFullEngine(engine), stateId);
}

/**
 * Mock facet value builder
 */
export function createMockFacetValue(overrides?: Partial<FacetValue>): FacetValue {
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
