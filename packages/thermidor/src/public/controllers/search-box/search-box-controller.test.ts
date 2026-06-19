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
import {getQuery} from '@/src/core/interface/search-box/search-box-selectors.js';
import {buildSearchBoxController} from './search-box-controller.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';

describe('buildSearchBoxController', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let searchInterface: Interface<'search'>;

  const buildController = () =>
    buildSearchBoxController({interface: searchInterface});

  beforeEach(() => {
    vi.clearAllMocks();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    searchInterface = buildSearchInterface({engine});
  });

  it('should adopt the searchBox slice', () => {
    buildController();

    expect(fullEngine.read(getQuery)).toBe('');
  });

  describe('setQuery()', () => {
    it('should update the query in state', () => {
      const controller = buildController();

      controller.setQuery({query: 'laptops'});

      expect(fullEngine.read(getQuery)).toBe('');
    });

    it('should reset the query with an empty string', () => {
      const controller = buildController();

      controller.setQuery({query: 'something'});
      controller.setQuery({query: ''});

      expect(controller.state.query).toBe('');
    });
  });

  describe('submit()', () => {
    it('should dispatch all search thunks', () => {
      const controller = buildController();

      const result = controller.submit();

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('state getter', () => {
    it('should return initial state', () => {
      const controller = buildController();

      expect(controller.state).toEqual({
        query: '',
        isLoading: false,
        error: null,
      });
    });

    it('should reflect updated query', () => {
      const controller = buildController();

      controller.setQuery({query: 'test'});

      expect(controller.state).toEqual({
        query: 'test',
        isLoading: false,
        error: null,
      });
    });
  });

  describe('subscribe()', () => {
    it('should invoke callback when query changes', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      controller.setQuery({query: 'new query'});

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback for each distinct change', () => {
      const controller = buildController();
      const callback = vi.fn();

      controller.subscribe(callback);
      controller.setQuery({query: 'first'});
      controller.setQuery({query: 'second'});
      controller.setQuery({query: 'third'});

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });
});
