import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, nextTick} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {
  buildSurfaceController,
  type SurfaceController,
} from './surface-controller.js';
import {SURFACES_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {PersistenceAdapter} from '@/src/api/adapters/types.js';

describe('buildSurfaceController persistence integration', () => {
  let engine: Engine;
  let controller: SurfaceController;
  let persistence: PersistenceAdapter;

  beforeEach(() => {
    engine = createTestEngine();

    persistence = {
      save: vi.fn(async () => undefined),
      load: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      list: vi.fn(async () => []),
    };

    controller = buildSurfaceController(engine, persistence);
  });

  it('hydrates from persistence on startup', async () => {
    const persisted = {
      'surface-1': {
        id: 'surface-1',
        type: 'card',
        rootComponent: {type: 'Root', props: {}},
        dataModel: {name: 'A'},
        createdAt: 1,
        updatedAt: 1,
      },
    };
    (persistence.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      persisted
    );

    controller = buildSurfaceController(engine, persistence);
    await nextTick();

    expect(controller.surfaces.get('surface-1')).toEqual(
      persisted['surface-1']
    );
  });

  it('persists after applySnapshot', async () => {
    await nextTick();

    controller.applySnapshot({
      surfaceId: 'surface-1',
      updates: {
        type: 'card',
        rootComponent: {type: 'Root', props: {}},
        dataModel: {value: 42},
      },
    });

    expect(persistence.save).toHaveBeenCalledWith(
      SURFACES_PERSISTENCE_KEY,
      expect.objectContaining({
        'surface-1': expect.objectContaining({
          id: 'surface-1',
          type: 'card',
        }),
      })
    );
  });

  it('deletes persisted key when surfaces become empty', async () => {
    await nextTick();

    controller.applySnapshot({
      surfaceId: 'surface-1',
      updates: {
        type: 'card',
        rootComponent: {type: 'Root', props: {}},
        dataModel: {},
      },
    });
    controller.clearSurface('surface-1');

    expect(persistence.delete).toHaveBeenCalledWith(SURFACES_PERSISTENCE_KEY);
  });
});
