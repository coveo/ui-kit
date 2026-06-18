/**
 * ResultList Controller Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/test/test-utils.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateResultsActions} from '@/src/core/internal/result-list/result-list-actions.js';
import {buildResultListController} from './result-list-controller.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {STATE_ID} from '@/src/core/interface/utils/symbols.js';

describe('buildResultListController', () => {
  let engine: Engine;
  let searchInterface: Interface<'search'>;

  beforeEach(() => {
    engine = createTestEngine();
    searchInterface = buildSearchInterface({engine});
  });

  it('should adopt the result slice and return defined state', () => {
    const controller = buildResultListController({interface: searchInterface});
    expect(controller.state).toBeDefined();
  });

  describe('state getter', () => {
    it('should return empty results initially', () => {
      const controller = buildResultListController({
        interface: searchInterface,
      });

      expect(controller.state).toEqual({results: []});
    });

    it('should return results after they are set via scoped action', () => {
      const controller = buildResultListController({
        interface: searchInterface,
      });

      const stateId = searchInterface[STATE_ID];
      const actions = getOrCreateResultsActions(stateId);
      const fullEngine = getFullEngine(engine);

      const mockResults = createMockSearchResults(3);
      fullEngine.mutate(actions.setResultsFromResponse(mockResults));

      expect(controller.state.results).toHaveLength(3);
      expect(controller.state.results[0].uniqueId).toBe(
        mockResults[0].uniqueId
      );
      expect(controller.state.results[0].title).toBe(mockResults[0].title);
    });
  });

  describe('subscribe()', () => {
    it('should invoke callback when results change', () => {
      const controller = buildResultListController({
        interface: searchInterface,
      });
      const callback = vi.fn();

      const stateId = searchInterface[STATE_ID];
      const actions = getOrCreateResultsActions(stateId);
      const fullEngine = getFullEngine(engine);

      controller.subscribe(callback);
      fullEngine.mutate(
        actions.setResultsFromResponse(createMockSearchResults(1))
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback for each distinct change', () => {
      const controller = buildResultListController({
        interface: searchInterface,
      });
      const callback = vi.fn();

      const stateId = searchInterface[STATE_ID];
      const actions = getOrCreateResultsActions(stateId);
      const fullEngine = getFullEngine(engine);

      controller.subscribe(callback);
      fullEngine.mutate(
        actions.setResultsFromResponse(createMockSearchResults(1))
      );
      fullEngine.mutate(
        actions.setResultsFromResponse(createMockSearchResults(3))
      );
      fullEngine.mutate(actions.setResultsFromResponse([]));

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should not invoke callback when unrelated state changes', async () => {
      const fullEngine = getFullEngine(engine);
      const controller = buildResultListController({
        interface: searchInterface,
      });
      const callback = vi.fn();

      controller.subscribe(callback);

      // Mutate a different slice (searchBox) — should not trigger result-list callback
      const {getOrCreateSearchBoxActions} =
        await import('@/src/core/internal/search-box/search-box-actions.js');
      const stateId = searchInterface[STATE_ID];
      const searchBoxActions = getOrCreateSearchBoxActions(stateId);
      fullEngine.mutate(searchBoxActions.setQuery('unrelated change'));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
