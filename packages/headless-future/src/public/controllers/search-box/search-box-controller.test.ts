/**
 * SearchBox Controller Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  Engine,
  FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import {buildSearchBoxController} from './search-box-controller.js';

vi.mock('@/src/api/index.js', () => ({
  executeSearchAPI: vi.fn(),
}));

import {executeSearchAPI} from '@/src/api/index.js';

describe('buildSearchBoxController', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
  });

  it('should adopt the searchBox slice', () => {
    buildSearchBoxController(engine);

    // If the slice was adopted, reading from it should not throw
    expect(fullEngine.read(searchBoxSelectors.query)).toBe('');
  });

  describe('updateQuery()', () => {
    it('should update the query in state', () => {
      const controller = buildSearchBoxController(engine);

      controller.updateQuery('laptops');

      expect(fullEngine.read(searchBoxSelectors.query)).toBe('laptops');
    });

    it('should reset the query with an empty string', () => {
      const controller = buildSearchBoxController(engine);

      controller.updateQuery('something');
      controller.updateQuery('');

      expect(fullEngine.read(searchBoxSelectors.query)).toBe('');
    });
  });

  describe('submit()', () => {
    it('should call executeSearchAPI with the engine', () => {
      const controller = buildSearchBoxController(engine);

      controller.submit();

      expect(executeSearchAPI).toHaveBeenCalledOnce();
    });
  });

  describe('state getter', () => {
    it('should return initial state', () => {
      const controller = buildSearchBoxController(engine);

      expect(controller.state).toEqual({query: ''});
    });

    it('should reflect updated query', () => {
      const controller = buildSearchBoxController(engine);

      controller.updateQuery('test');

      expect(controller.state).toEqual({query: 'test'});
    });
  });

  describe('query getter', () => {
    it('should return the initial query', () => {
      const controller = buildSearchBoxController(engine);

      expect(controller.query).toBe('');
    });

    it('should return the updated query', () => {
      const controller = buildSearchBoxController(engine);

      controller.updateQuery('headphones');

      expect(controller.query).toBe('headphones');
    });
  });

  describe('subscribe()', () => {
    it('should invoke callback when query changes', () => {
      const controller = buildSearchBoxController(engine);
      const callback = vi.fn();

      controller.subscribe(callback);
      controller.updateQuery('new query');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback for each distinct change', () => {
      const controller = buildSearchBoxController(engine);
      const callback = vi.fn();

      controller.subscribe(callback);
      controller.updateQuery('first');
      controller.updateQuery('second');
      controller.updateQuery('third');

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });
});
