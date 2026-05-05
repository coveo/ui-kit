import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, nextTick} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {
  buildContextBridgeController,
  type ContextBridgeController,
} from './context-bridge-controller.js';
import {CONTEXT_BRIDGE_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {PersistenceAdapter} from '@/src/api/adapters/types.js';

describe('buildContextBridgeController persistence integration', () => {
  let engine: Engine;
  let controller: ContextBridgeController;
  let persistence: PersistenceAdapter;

  beforeEach(() => {
    engine = createTestEngine();

    persistence = {
      save: vi.fn(async () => undefined),
      load: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      list: vi.fn(async () => []),
    };

    controller = buildContextBridgeController(engine, persistence);
  });

  it('hydrates context bridge state from persistence on startup', async () => {
    (persistence.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      selectedProducts: ['p-1'],
      activeQuery: 'boots',
      activeFilters: {brand: ['x']},
      citations: [{id: 'c1', turnId: 't1'}],
    });

    controller = buildContextBridgeController(engine, persistence);
    await nextTick();

    expect(controller.state).toEqual({
      selectedProducts: ['p-1'],
      activeQuery: 'boots',
      activeFilters: {brand: ['x']},
      citations: [{id: 'c1', turnId: 't1'}],
    });
  });

  it('persists context bridge changes', async () => {
    await nextTick();

    controller.syncSearchQuery('winter boots');

    expect(persistence.save).toHaveBeenCalledWith(
      CONTEXT_BRIDGE_PERSISTENCE_KEY,
      expect.objectContaining({activeQuery: 'winter boots'})
    );
  });
});
