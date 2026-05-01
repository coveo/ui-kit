/**
 * ResultList Controller Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/core/test-utils.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/results/slice.js';
import {resultSlice} from '@/src/core/internal/result/slice.js';
import {buildResultListController} from './controller.js';

describe('buildResultListController', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
  });

  it('should adopt the result slice', () => {
    const spy = vi.spyOn(engine, 'adoptSlice');

    buildResultListController(engine);

    expect(spy).toHaveBeenCalledWith(resultSlice);
  });

  describe('state getter', () => {
    it('should return empty results initially', async () => {
      await engine.adoptSlice(resultsSlice);
      const controller = buildResultListController(engine);

      expect(controller.state).toEqual({results: []});
    });

    it('should return results after they are set', async () => {
      await engine.adoptSlice(resultsSlice);
      const controller = buildResultListController(engine);

      const mockResults = createMockSearchResults(3);
      engine.mutate(resultsSlice.actions.setResults(mockResults));

      expect(controller.state.results).toEqual(mockResults);
      expect(controller.state.results).toHaveLength(3);
    });

    it('should reflect cleared results', async () => {
      await engine.adoptSlice(resultsSlice);
      const controller = buildResultListController(engine);

      engine.mutate(
        resultsSlice.actions.setResults(createMockSearchResults(2))
      );
      engine.mutate(resultsSlice.actions.clearResults());

      expect(controller.state.results).toEqual([]);
    });
  });

  describe('subscribe()', () => {
    it('should invoke callback when results change', async () => {
      await engine.adoptSlice(resultsSlice);
      const controller = buildResultListController(engine);
      const callback = vi.fn();

      controller.subscribe(callback);
      engine.mutate(
        resultsSlice.actions.setResults(createMockSearchResults(1))
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback for each distinct change', async () => {
      await engine.adoptSlice(resultsSlice);
      const controller = buildResultListController(engine);
      const callback = vi.fn();

      controller.subscribe(callback);
      engine.mutate(
        resultsSlice.actions.setResults(createMockSearchResults(1))
      );
      engine.mutate(
        resultsSlice.actions.setResults(createMockSearchResults(3))
      );
      engine.mutate(resultsSlice.actions.clearResults());

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should not invoke callback when unrelated state changes', async () => {
      await engine.adoptSlice(resultsSlice);
      const controller = buildResultListController(engine);
      const callback = vi.fn();

      controller.subscribe(callback);
      // Changing loading state doesn't affect the results selector
      engine.mutate(resultsSlice.actions.setLoading(true));
      engine.mutate(resultsSlice.actions.setLoading(false));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
