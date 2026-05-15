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

const mockExecuteSearch = vi.fn();

vi.mock(
  '@/src/api/interface/search-endpoint/search-endpoint-facade.js',
  () => ({
    SearchEndpointFacade: {
      getInstance: vi.fn(() => ({
        callEndpoint: mockExecuteSearch,
        onRequest: vi.fn(),
      })),
    },
  })
);

describe('buildSearchBoxController', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  const buildController = () => buildSearchBoxController({engine});

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteSearch.mockReset();
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
  });

  it('should adopt the searchBox slice', () => {
    buildController();

    // If the slice was adopted, reading from it should not throw
    expect(fullEngine.read(searchBoxSelectors.getQuery)).toBe('');
  });

  describe('setQuery()', () => {
    it('should update the query in state', () => {
      const controller = buildController();

      controller.setQuery({query: 'laptops'});

      expect(fullEngine.read(searchBoxSelectors.getQuery)).toBe('laptops');
    });

    it('should reset the query with an empty string', () => {
      const controller = buildController();

      controller.setQuery({query: 'something'});
      controller.setQuery({query: ''});

      expect(fullEngine.read(searchBoxSelectors.getQuery)).toBe('');
    });
  });

  describe('submit()', () => {
    it('should execute the search via the facade', () => {
      const controller = buildController();

      controller.submit();

      expect(mockExecuteSearch).toHaveBeenCalledOnce();
    });
  });

  describe('state getter', () => {
    it('should return initial state', () => {
      const controller = buildController();

      expect(controller.state).toEqual({query: ''});
    });

    it('should reflect updated query', () => {
      const controller = buildController();

      controller.setQuery({query: 'test'});

      expect(controller.state).toEqual({query: 'test'});
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
