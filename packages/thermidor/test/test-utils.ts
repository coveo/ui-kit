/**
 * Test Utilities
 *
 * Common helpers and mock data builders for unit tests
 */

import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {BaseInterface, createNoopThunk} from '@/src/internal/utils/index.js';
import type {
  FacadeResolver,
  Facades,
  GenerativeUnifiedInterface,
} from '@/src/internal/utils/index.js';

/**
 * Create a fresh engine instance for testing
 * Ensures test isolation by providing a new engine per test
 */
export function createTestEngine(): Engine {
  return new Engine();
}

const noopThunk = createNoopThunk('test-interface-noop');
const noopResolver: FacadeResolver = () => noopThunk;

class TestInterface
  extends BaseInterface<'generativeUnified'>
  implements GenerativeUnifiedInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'generativeUnified', {
      conversation: noopResolver,
    } satisfies Record<Facades['generativeUnified'], FacadeResolver>);
  }
}

/**
 * Create a mock interface handle for testing controllers and slices that
 * require an interface handle. The stateId defaults to 'test'.
 */
export function createTestInterface(engine: Engine, stateId = 'test'): GenerativeUnifiedInterface {
  return new TestInterface(getFullEngine(engine), stateId);
}
