import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as mutations from './results-mutators.js';
import {createMockSearchResults} from '@/src/test/test-utils.js';
import {resultsSlice} from '@/src/core/internal/results/results-slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

describe('resultsMutations', () => {
  let engine: Engine;
  let mutateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateSpy = vi.fn();
    engine = {
      mutate: mutateSpy,
    } as unknown as Engine;
  });

  it('setResults() should call engine.mutate with setResults action', () => {
    const results = createMockSearchResults(2);

    mutations.setResults(engine, results);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultsSlice.actions.setResults(results)
    );
  });

  it('setLoading() should call engine.mutate with setLoading action', () => {
    mutations.setLoading(engine, true);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultsSlice.actions.setLoading(true)
    );
  });

  it('setError() should call engine.mutate with setError action', () => {
    mutations.setError(engine, 'Search failed');

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultsSlice.actions.setError('Search failed')
    );
  });

  it('clearResults() should call engine.mutate with clearResults action', () => {
    mutations.clearResults(engine);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultsSlice.actions.clearResults()
    );
  });
});
