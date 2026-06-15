import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {loadSearchBox} from './search-box-loader.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine =>
  ({
    adoptSlice: vi.fn(async () => undefined),
  }) as unknown as MockEngine;

describe('loadSearchBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts search-box slice on first load', () => {
    const engine = createMockEngine();

    loadSearchBox(engine, 'test-loader');

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(
      getOrCreateSearchBoxSlice('test-loader')
    );
  });

  it('does not initialize twice for the same engine', () => {
    const engine = createMockEngine();

    loadSearchBox(engine, 'test-loader2');
    loadSearchBox(engine, 'test-loader2');

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadSearchBox(firstEngine, 'test-loader3');
    loadSearchBox(secondEngine, 'test-loader4');

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
  });
});
