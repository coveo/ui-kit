/**
 * SearchBox Public Actions Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
  Engine,
  FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {loadSearchBoxActions} from './search-box-actions.js';

describe('search-box actions', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let searchInterface: Interface<'search'>;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    searchInterface = buildSearchInterface({engine});
  });

  describe('loadSearchBoxActions', () => {
    it('should adopt the searchBox slice on the engine', () => {
      loadSearchBoxActions({interface: searchInterface});
      const stateId = searchInterface[STATE_ID];
      const selectors = getOrCreateSearchBoxSelectors(stateId);
      expect(fullEngine.read(selectors.getQuery)).toBe('');
    });

    it('should return an object with setQuery and submit actions', () => {
      const actions = loadSearchBoxActions({interface: searchInterface});
      expect(actions).toHaveProperty('setQuery');
      expect(actions).toHaveProperty('submit');
      expect(typeof actions.setQuery).toBe('function');
      expect(typeof actions.submit).toBe('function');
    });

    it('should update state when setQuery action is called', () => {
      const actions = loadSearchBoxActions({interface: searchInterface});
      const stateId = searchInterface[STATE_ID];
      const selectors = getOrCreateSearchBoxSelectors(stateId);

      actions.setQuery({query: 'hello world'});
      expect(fullEngine.read(selectors.getQuery)).toBe('hello world');
    });

    it('should accept empty string via setQuery action', () => {
      const actions = loadSearchBoxActions({interface: searchInterface});
      const stateId = searchInterface[STATE_ID];
      const selectors = getOrCreateSearchBoxSelectors(stateId);

      actions.setQuery({query: 'something'});
      actions.setQuery({query: ''});
      expect(fullEngine.read(selectors.getQuery)).toBe('');
    });

    it('should handle multiple calls to setQuery', () => {
      const actions = loadSearchBoxActions({interface: searchInterface});
      const stateId = searchInterface[STATE_ID];
      const selectors = getOrCreateSearchBoxSelectors(stateId);

      actions.setQuery({query: 'first'});
      expect(fullEngine.read(selectors.getQuery)).toBe('first');

      actions.setQuery({query: 'second'});
      expect(fullEngine.read(selectors.getQuery)).toBe('second');
    });

    it('should return a submit function that dispatches thunks', () => {
      const actions = loadSearchBoxActions({interface: searchInterface});

      const result = actions.submit();

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
