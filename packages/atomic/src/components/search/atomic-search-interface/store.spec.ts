import type {SearchEngine} from '@coveo/headless';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createSearchStore, type SearchStore} from './store';

vi.mock('@coveo/headless', {spy: true});

describe('SearchStore', () => {
  let store: SearchStore;

  beforeEach(() => {
    store = createSearchStore();
  });

  describe('#createSearchStore', () => {
    it('should initialize with correct default state', () => {
      expect(store.state).toEqual({
        loadingFlags: [],
        iconAssetsPath: '',
        resultList: undefined,
        mobileBreakpoint: '1024px',
        facets: {},
        numericFacets: {},
        dateFacets: {},
        categoryFacets: {},
        facetElements: [],
        fieldsToInclude: [],
        sortOptions: [],
      });
    });
  });

  describe('#setLoadingFlag', () => {
    it('should add a loading flag to the state', () => {
      const loadingFlag = 'test-loading-flag';

      expect(store.state.loadingFlags).not.toContain(loadingFlag);

      store.setLoadingFlag(loadingFlag);

      expect(store.state.loadingFlags).toContain(loadingFlag);
    });
  });

  describe('#unsetLoadingFlag', () => {
    it('should remove a loading flag from the state', () => {
      const loadingFlag = 'test-loading-flag';

      store.setLoadingFlag(loadingFlag);
      expect(store.state.loadingFlags).toContain(loadingFlag);

      store.unsetLoadingFlag(loadingFlag);
      expect(store.state.loadingFlags).not.toContain(loadingFlag);
    });

    it('should remove all occurrences of a loading flag', () => {
      const loadingFlag = 'test-loading-flag';

      store.setLoadingFlag(loadingFlag);
      store.setLoadingFlag(loadingFlag);
      expect(store.state.loadingFlags).toEqual([loadingFlag, loadingFlag]);

      store.unsetLoadingFlag(loadingFlag);
      expect(store.state.loadingFlags).not.toContain(loadingFlag);
    });
  });

  describe('#hasLoadingFlag', () => {
    it('should return true when the loading flag exists', () => {
      const loadingFlag = 'test-loading-flag';

      store.setLoadingFlag(loadingFlag);

      expect(store.hasLoadingFlag(loadingFlag)).toBe(true);
    });

    it('should return false when the loading flag does not exist', () => {
      const loadingFlag = 'test-loading-flag';

      expect(store.hasLoadingFlag(loadingFlag)).toBe(false);
    });
  });

  describe('#isMobile', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should return true when viewport is below mobile breakpoint', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      expect(store.isMobile()).toBe(true);
    });

    it('should return false when viewport is above mobile breakpoint', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      expect(store.isMobile()).toBe(false);
    });
  });

  describe('#registerFacet', () => {
    it('should register a facet element to the store', () => {
      const element = document.createElement('div');
      element.setAttribute('facet-id', 'test-facet');
      const data = {
        facetId: 'test-facet',
        element,
        label: () => 'Test Label',
        isHidden: () => false,
      };

      store.registerFacet('facets', data);

      expect(store.state.facets['test-facet']).toBe(data);
      expect(store.state.facetElements).toContain(element);
    });

    it('should register a numeric facet to the store', () => {
      const element = document.createElement('div');
      element.setAttribute('facet-id', 'numeric-facet');
      const data = {
        facetId: 'numeric-facet',
        element,
        label: () => 'Numeric Facet',
        isHidden: () => false,
        format: () => 'formatted',
      };

      store.registerFacet('numericFacets', data);

      expect(store.state.numericFacets['numeric-facet']).toBe(data);
      expect(store.state.facetElements).toContain(element);
    });

    it('should not register a facet when it has the is-refine-modal attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('facet-id', 'refine-facet');
      element.setAttribute('is-refine-modal', '');
      const data = {
        facetId: 'refine-facet',
        element,
        label: () => 'Refine Facet',
        isHidden: () => false,
      };

      store.registerFacet('facets', data);

      expect(store.state.facets['refine-facet']).toBeUndefined();
      expect(store.state.facetElements).not.toContain(element);
    });
  });

  describe('#getFacetElements', () => {
    it('should return only elements that are in the document', () => {
      const inDoc = document.createElement('div');
      inDoc.setAttribute('facet-id', 'in-doc');
      document.body.appendChild(inDoc);

      const notInDoc = document.createElement('div');
      notInDoc.setAttribute('facet-id', 'not-in-doc');

      store.state.facetElements = [inDoc, notInDoc];

      const result = store.getFacetElements();

      expect(result).toContain(inDoc);
      expect(result).not.toContain(notInDoc);

      document.body.removeChild(inDoc);
    });

    it('should return an empty array when no elements are in the document', () => {
      const notInDoc1 = document.createElement('div');
      const notInDoc2 = document.createElement('div');

      store.state.facetElements = [notInDoc1, notInDoc2];

      const result = store.getFacetElements();

      expect(result).toEqual([]);
    });
  });

  describe('#waitUntilAppLoaded', () => {
    it('should call the callback immediately when there are no loading flags', () => {
      const callback = vi.fn();

      store.waitUntilAppLoaded(callback);

      expect(callback).toHaveBeenCalledOnce();
    });

    it('should call the callback when loading flags become empty', () => {
      const callback = vi.fn();

      store.setLoadingFlag('loading');
      store.waitUntilAppLoaded(callback);

      expect(callback).not.toHaveBeenCalled();

      store.unsetLoadingFlag('loading');

      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('#getUniqueIDFromEngine', () => {
    it('should return the search UID from the engine state', () => {
      const mockEngine = {
        state: {
          search: {
            response: {
              searchUid: 'test-search-uid',
            },
          },
        },
      } as unknown as SearchEngine;

      expect(store.getUniqueIDFromEngine(mockEngine)).toBe('test-search-uid');
    });
  });

  describe('#getAllFacets', () => {
    it('should return all facets from all facet types', () => {
      const facetElement = document.createElement('div');
      facetElement.setAttribute('facet-id', 'regular-facet');
      const facetData = {
        facetId: 'regular-facet',
        element: facetElement,
        label: () => 'Regular Facet',
        isHidden: () => false,
      };

      const numericElement = document.createElement('div');
      numericElement.setAttribute('facet-id', 'numeric-facet');
      const numericData = {
        facetId: 'numeric-facet',
        element: numericElement,
        label: () => 'Numeric Facet',
        isHidden: () => false,
        format: () => 'formatted',
      };

      store.registerFacet('facets', facetData);
      store.registerFacet('numericFacets', numericData);

      const allFacets = store.getAllFacets();

      expect(allFacets['regular-facet']).toBe(facetData);
      expect(allFacets['numeric-facet']).toBe(numericData);
    });

    it('should return an empty object when no facets are registered', () => {
      const allFacets = store.getAllFacets();

      expect(allFacets).toEqual({});
    });
  });

  describe('#addFieldsToInclude', () => {
    it('should add fields to the fieldsToInclude state', () => {
      expect(store.state.fieldsToInclude).toEqual([]);

      store.addFieldsToInclude(['field1', 'field2']);

      expect(store.state.fieldsToInclude).toEqual(['field1', 'field2']);
    });

    it('should append fields to existing fieldsToInclude', () => {
      store.addFieldsToInclude(['field1', 'field2']);
      store.addFieldsToInclude(['field3']);

      expect(store.state.fieldsToInclude).toEqual([
        'field1',
        'field2',
        'field3',
      ]);
    });
  });
});
