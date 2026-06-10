import {beforeEach, describe, expect, it, vi} from 'vitest';
import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import {loadSearchEndpoint} from './search-endpoint-loader.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine =>
  ({
    adoptSlice: vi.fn(async () => undefined),
  }) as unknown as MockEngine;

describe('loadSearchEndpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts search-endpoint slice on first load', () => {
    const engine = createMockEngine();

    loadSearchEndpoint(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(searchEndpointSlice);
  });

  it('does not initialize twice for the same engine', () => {
    const engine = createMockEngine();

    loadSearchEndpoint(engine);
    loadSearchEndpoint(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadSearchEndpoint(firstEngine);
    loadSearchEndpoint(secondEngine);

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
  });
});
