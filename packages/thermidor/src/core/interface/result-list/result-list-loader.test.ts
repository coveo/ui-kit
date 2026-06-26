import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {loadResultList} from './result-list-loader.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine =>
  ({
    adoptSlice: vi.fn(async () => undefined),
  }) as unknown as MockEngine;

describe('loadResultList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts scoped result list slice on first load', () => {
    const engine = createMockEngine();

    loadResultList(engine, 'test-interface');

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(
      getOrCreateResultsSlice('test-interface')
    );
  });

  it('does not initialize twice for the same engine', () => {
    const engine = createMockEngine();

    loadResultList(engine, 'test-interface');
    loadResultList(engine, 'test-interface');

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadResultList(firstEngine, 'iface-1');
    loadResultList(secondEngine, 'iface-1');

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
  });

  it('defaults to "default" interfaceId', () => {
    const engine = createMockEngine();

    loadResultList(engine);

    expect(engine.adoptSlice).toHaveBeenCalledWith(
      getOrCreateResultsSlice('default')
    );
  });
});
