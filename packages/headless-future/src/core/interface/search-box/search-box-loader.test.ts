import {beforeEach, describe, expect, it, vi} from 'vitest';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
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

    loadSearchBox(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(searchBoxSlice);
  });

  it('does not initialize twice for the same engine', () => {
    const engine = createMockEngine();

    loadSearchBox(engine);
    loadSearchBox(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadSearchBox(firstEngine);
    loadSearchBox(secondEngine);

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
  });
});
