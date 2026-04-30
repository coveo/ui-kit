/**
 * SearchBox Public Actions Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {createTestEngine} from '@/src/core/test-utils.js';
import * as selectors from '@/src/core/interface/search-box/selectors.js';
import {loadSearchBoxActions, setQuery} from './search-box.js';

describe('search-box actions', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
  });

  describe('loadSearchBoxActions', () => {
    it('should adopt the searchBox slice on the engine', async () => {
      loadSearchBoxActions(engine);
      // After adopting, the slice should be available and query should be default
      // Give time for adoptSlice (async) to settle
      await new Promise((r) => setTimeout(r, 0));
      expect(engine.read(selectors.query)).toBe('');
    });

    it('should return an object with a setQuery action', () => {
      const actions = loadSearchBoxActions(engine);
      expect(actions).toHaveProperty('setQuery');
      expect(typeof actions.setQuery).toBe('function');
    });

    it('should update state when setQuery action is called', async () => {
      const actions = loadSearchBoxActions(engine);
      await new Promise((r) => setTimeout(r, 0));

      actions.setQuery('hello world');
      expect(engine.read(selectors.query)).toBe('hello world');
    });

    it('should accept empty string via setQuery action', async () => {
      const actions = loadSearchBoxActions(engine);
      await new Promise((r) => setTimeout(r, 0));

      actions.setQuery('something');
      actions.setQuery('');
      expect(engine.read(selectors.query)).toBe('');
    });

    it('should handle multiple calls to setQuery', async () => {
      const actions = loadSearchBoxActions(engine);
      await new Promise((r) => setTimeout(r, 0));

      actions.setQuery('first');
      expect(engine.read(selectors.query)).toBe('first');

      actions.setQuery('second');
      expect(engine.read(selectors.query)).toBe('second');
    });
  });

  describe('setQuery (named export)', () => {
    it('should return a function', () => {
      const action = setQuery(engine);
      expect(typeof action).toBe('function');
    });

    it('should adopt the slice if not already adopted', async () => {
      setQuery(engine);
      await new Promise((r) => setTimeout(r, 0));
      expect(engine.read(selectors.query)).toBe('');
    });

    it('should update state when the returned function is called', async () => {
      const action = setQuery(engine);
      await new Promise((r) => setTimeout(r, 0));

      action('test query');
      expect(engine.read(selectors.query)).toBe('test query');
    });

    it('should not re-adopt the slice on subsequent calls with the same engine', async () => {
      // First call adopts the slice
      const action1 = setQuery(engine);
      await new Promise((r) => setTimeout(r, 0));

      action1('first');
      expect(engine.read(selectors.query)).toBe('first');

      // Second call should skip adoption but still work
      const action2 = setQuery(engine);
      action2('second');
      expect(engine.read(selectors.query)).toBe('second');
    });

    it('should work with different engine instances independently', async () => {
      const engine2 = createTestEngine();

      const action1 = setQuery(engine);
      const action2 = setQuery(engine2);
      await new Promise((r) => setTimeout(r, 0));

      action1('engine1 query');
      action2('engine2 query');

      expect(engine.read(selectors.query)).toBe('engine1 query');
      expect(engine2.read(selectors.query)).toBe('engine2 query');
    });

    it('should work after loadSearchBoxActions has already adopted the slice', async () => {
      // Adopt via loadSearchBoxActions first
      loadSearchBoxActions(engine);
      await new Promise((r) => setTimeout(r, 0));

      // Named export should still work (slice already adopted)
      const action = setQuery(engine);
      action('after load');
      expect(engine.read(selectors.query)).toBe('after load');
    });
  });
});
