import {describe, it, expect, beforeEach, vi} from 'vitest';
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import * as searchBoxMutators from '@/src/core/interface/search-box/search-box-mutators.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {createMockEngine} from '@/src/test/test-utils.js';
import {buildSearchBoxController} from './search-box-controller.js';

vi.mock('@/src/api/index.js', () => ({
  executeSearchAPI: vi.fn(),
}));

import {executeSearchAPI} from '@/src/api/index.js';

describe('buildSearchBoxController', () => {
  let mockEngine: ReturnType<typeof createMockEngine>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEngine = createMockEngine();
  });

  it('should adopt the searchBox slice', () => {
    buildSearchBoxController(mockEngine.engine);

    expect(mockEngine.adoptSliceSpy).toHaveBeenCalledExactlyOnceWith(
      searchBoxSlice
    );
  });

  describe('updateQuery()', () => {
    it('should call setQuery mutator with engine and query', () => {
      const setQuerySpy = vi
        .spyOn(searchBoxMutators, 'setQuery')
        .mockImplementation(() => {});
      const controller = buildSearchBoxController(mockEngine.engine);

      controller.updateQuery('laptops');

      expect(setQuerySpy).toHaveBeenCalledExactlyOnceWith(
        mockEngine.engine,
        'laptops'
      );
    });
  });

  describe('submit()', () => {
    it('should call executeSearchAPI with the engine', () => {
      const controller = buildSearchBoxController(mockEngine.engine);

      controller.submit();

      expect(executeSearchAPI).toHaveBeenCalledExactlyOnceWith(
        mockEngine.engine
      );
    });
  });

  describe('state getter', () => {
    it('should call engine.read with a selector and return its output', () => {
      mockEngine.readSpy.mockReturnValue({query: 'from-engine'});
      const controller = buildSearchBoxController(mockEngine.engine);

      expect(controller.state).toEqual({query: 'from-engine'});
      expect(mockEngine.readSpy).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function)
      );
    });

    it('should use the same selector as subscribe()', () => {
      const controller = buildSearchBoxController(mockEngine.engine);
      const callback = vi.fn();

      controller.subscribe(callback);
      void controller.state;

      const subscribedSelector = mockEngine.subscribeSpy.mock.calls[0][0];
      const stateSelector = mockEngine.readSpy.mock.calls[0][0];
      expect(stateSelector).toBe(subscribedSelector);
    });
  });

  describe('query getter', () => {
    it('should call engine.read with query selector', () => {
      mockEngine.readSpy.mockReturnValue('headphones');
      const controller = buildSearchBoxController(mockEngine.engine);

      expect(controller.query).toBe('headphones');
      expect(mockEngine.readSpy).toHaveBeenCalledExactlyOnceWith(
        searchBoxSelectors.query
      );
    });
  });

  describe('subscribe()', () => {
    it('should call engine.subscribe with selector and callback', () => {
      const controller = buildSearchBoxController(mockEngine.engine);
      const callback = vi.fn();

      controller.subscribe(callback);

      expect(mockEngine.subscribeSpy).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function),
        callback
      );
    });
  });
});
