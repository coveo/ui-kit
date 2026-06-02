/**
 * ResultList Controller Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import * as resultListActions from '@/src/core/internal/result-list/result-list-actions.js';
import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import * as searchEndpointActions from '@/src/core/internal/api/search-endpoint/search-endpoint-actions.js';
import {buildResultListController} from './result-list-controller.js';

describe('buildResultListController', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
  });

  it('should adopt the result slice', async () => {
    // Adopt resultsSlice first so state can be read; the controller
    // internally adopts resultSlice (single-result slice) as well.
    await getFullEngine(engine).adoptSlice(resultsSlice);
    const controller = buildResultListController({engine});
    expect(controller.state).toBeDefined();
  });

  describe('state getter', () => {
    it('should return empty results initially', async () => {
      await getFullEngine(engine).adoptSlice(resultsSlice);
      const controller = buildResultListController({engine});

      expect(controller.state).toEqual({results: []});
    });

    it('should return results after they are set', async () => {
      const fullEngine = getFullEngine(engine);
      await fullEngine.adoptSlice(resultsSlice);
      const controller = buildResultListController({engine});

      const mockResults = createMockSearchResults(3);
      fullEngine.mutate(resultListActions.setResults(mockResults));

      expect(controller.state.results).toEqual(mockResults);
      expect(controller.state.results).toHaveLength(3);
    });

    it('should reflect cleared results', async () => {
      const fullEngine = getFullEngine(engine);
      await fullEngine.adoptSlice(resultsSlice);
      const controller = buildResultListController({engine});

      fullEngine.mutate(
        resultListActions.setResults(createMockSearchResults(2))
      );
      fullEngine.mutate(resultListActions.clearResults());

      expect(controller.state.results).toEqual([]);
    });
  });

  describe('subscribe()', () => {
    it('should invoke callback when results change', async () => {
      const fullEngine = getFullEngine(engine);
      await fullEngine.adoptSlice(resultsSlice);
      const controller = buildResultListController({engine});
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(
        resultListActions.setResults(createMockSearchResults(1))
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback for each distinct change', async () => {
      const fullEngine = getFullEngine(engine);
      await fullEngine.adoptSlice(resultsSlice);
      const controller = buildResultListController({engine});
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(
        resultListActions.setResults(createMockSearchResults(1))
      );
      fullEngine.mutate(
        resultListActions.setResults(createMockSearchResults(3))
      );
      fullEngine.mutate(resultListActions.clearResults());

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should not invoke callback when unrelated state changes', async () => {
      const fullEngine = getFullEngine(engine);
      await fullEngine.adoptSlice(resultsSlice);
      await fullEngine.adoptSlice(searchEndpointSlice);
      const controller = buildResultListController({engine});
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(searchEndpointActions.setStatus('pending'));
      fullEngine.mutate(searchEndpointActions.setStatus('idle'));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
