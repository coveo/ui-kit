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

    it('should return an object with sortBy action', () => {
      const actions = loadSortActions({interface: searchInterface});
      expect(actions).toHaveProperty('sortBy');
      expect(typeof actions.sortBy).toBe('function');
    });

    it('should return a promise from sortBy (triggers facade thunks)', () => {
      const actions = loadSortActions({interface: searchInterface});

      const result = actions.sortBy({by: 'relevance'});

      expect(result).toBeInstanceOf(Promise);
    });

    it('should update sort state when sortBy is called', () => {
      const actions = loadSortActions({interface: searchInterface});
      const selectors = getOrCreateSortSelectors(searchInterface);

      actions.sortBy({by: 'relevance'});

      expect(fullEngine.read(selectors.getAppliedSort)).toEqual({
        by: 'relevance',
      });
    });

    it('should handle sortBy with array criterion (compound sort)', () => {
      const actions = loadSortActions({interface: searchInterface});
      const selectors = getOrCreateSortSelectors(searchInterface);
      const compound = [
        {by: 'field' as const, field: 'price', direction: 'ascending' as const},
        {by: 'date' as const, direction: 'descending' as const},
      ];

      actions.sortBy(compound);

      expect(fullEngine.read(selectors.getAppliedSort)).toEqual(compound);
    });
  });
});
