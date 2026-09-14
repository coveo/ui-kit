/**
 * Test Utilities
 *
 * Common helpers and mock data builders for unit tests
 */

import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/commerce.js';
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
