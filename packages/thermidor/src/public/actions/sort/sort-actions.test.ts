import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, FullEngine, getFullEngine} from '@/src/internal/engine/index.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {loadSortActions} from './sort-actions.js';

describe('sort actions', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let searchInterface: ReturnType<typeof buildSearchInterface>;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    searchInterface = buildSearchInterface({engine});
  });

  describe('loadSortActions', () => {
    it('should adopt the sort slice on the engine', () => {
      loadSortActions({interface: searchInterface});
      const selectors = getOrCreateSortSelectors(searchInterface);
      expect(fullEngine.read(selectors.getAppliedSort)).toBeNull();
      expect(fullEngine.read(selectors.getAvailableSorts)).toEqual([]);
    });

    it('should return an object with sortBy and getState actions', () => {
      const actions = loadSortActions({interface: searchInterface});
      expect(actions).toHaveProperty('sortBy');
      expect(actions).toHaveProperty('getState');
      expect(typeof actions.sortBy).toBe('function');
      expect(typeof actions.getState).toBe('function');
    });

    it('should update sort state when sortBy is called', () => {
      const actions = loadSortActions({interface: searchInterface});

      actions.sortBy({sortCriteria: 'relevancy'});

      expect(actions.getState().appliedSort).toEqual({sortCriteria: 'relevancy'});
    });

    it('should return a promise from sortBy (triggers facade thunks)', () => {
      const actions = loadSortActions({interface: searchInterface});

      const result = actions.sortBy({sortCriteria: 'relevancy'});

      expect(result).toBeInstanceOf(Promise);
    });

    it('should return current sort state via getState', () => {
      const actions = loadSortActions({interface: searchInterface});

      const state = actions.getState();

      expect(state).toHaveProperty('appliedSort');
      expect(state).toHaveProperty('availableSorts');
      expect(state.appliedSort).toBeNull();
      expect(state.availableSorts).toEqual([]);
    });

    it('should handle multiple sortBy calls updating state correctly', () => {
      const actions = loadSortActions({interface: searchInterface});

      actions.sortBy({sortCriteria: 'relevancy'});
      expect(actions.getState().appliedSort).toEqual({sortCriteria: 'relevancy'});

      actions.sortBy({sortCriteria: 'date ascending'});
      expect(actions.getState().appliedSort).toEqual({
        sortCriteria: 'date ascending',
      });

      actions.sortBy({sortCriteria: '@price descending'});
      expect(actions.getState().appliedSort).toEqual({
        sortCriteria: '@price descending',
      });
    });
  });
});
