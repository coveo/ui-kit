import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {
  type BaseStore,
  createAppLoadedListener,
  createBaseStore,
  registerFacet,
  setLoadingFlag,
  unsetLoadingFlag,
  waitUntilAppLoaded,
} from './store';

describe('store', () => {
  describe('#createAppLoadedListener', () => {
    it("should execute the callback with 'true' when the are no loading flags", () => {
      const store = {
        state: {loadingFlags: []},
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const cb = vi.fn();

      createAppLoadedListener(store, cb);
      expect(cb).toHaveBeenCalledWith(true);
    });

    it("should execute the callback with 'false' when there are loading flags", () => {
      const store = {
        state: {loadingFlags: ['flag1', 'flag2']},
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const cb = vi.fn();

      createAppLoadedListener(store, cb);
      expect(cb).toHaveBeenCalledWith(false);
    });

    it('should add a change listener on the loadingFlags property that executes the callback with the correct value', () => {
      const onChange = vi.fn();
      const store = {
        state: {loadingFlags: ['flag1']},
        get: vi.fn(),
        set: vi.fn(),
        onChange,
      };
      const cb = vi.fn();

      createAppLoadedListener(store, cb);

      expect(onChange).toHaveBeenCalledWith(
        'loadingFlags',
        expect.any(Function)
      );

      onChange.mock.lastCall?.[1]();

      expect(cb).toHaveBeenCalledWith(false);

      store.state.loadingFlags = [];
      onChange.mock.lastCall?.[1]();

      expect(cb).toHaveBeenCalledWith(true);
    });
  });

  describe('#createBaseStore', () => {
    let state: Record<string, unknown> & {
      foo: string;
      bar: number;
    };
    let store: BaseStore<typeof state>;

    beforeEach(() => {
      state = {foo: 'hello', bar: 42};
      store = createBaseStore(state);
    });

    it('should return a #state object that proxies the initial state record received as an argument', () => {
      expect(store.state).toEqual(state);

      store.state.foo = 'world';
      expect(state.foo).toBe('world');

      state.bar = 100;
      expect(store.state.bar).toBe(100);
    });

    it('should return a #get function that retrieves the value of a given property from the #state', () => {
      expect(store.get('foo')).toBe('hello');
      expect(store.get('bar')).toBe(42);
    });

    it('should return a #set function that updates the value of a given property in the #state', () => {
      store.set('foo', 'world');
      expect(store.state.foo).toBe('world');
      store.set('bar', 100);
      expect(store.state.bar).toBe(100);
    });

    it('should return an #onChange function', () => {
      expect(store.onChange).toEqual(expect.any(Function));
    });

    describe('when calling the returned #onChange function', () => {
      it('should add a listener on the given property in the #state', () => {
        const cb = vi.fn();
        store.onChange('foo', cb);
        store.set('foo', 'changed');

        expect(cb).toHaveBeenCalledWith('changed');
      });

      it('should allow adding multiple listeners on the same property in the #state', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        store.onChange('foo', cb1);
        store.onChange('foo', cb2);
        store.set('foo', 'changed');

        expect(cb1).toHaveBeenCalledWith('changed');
        expect(cb2).toHaveBeenCalledWith('changed');
      });

      it('should not execute listener callbacks when a #state property is set to its current value', () => {
        const cb = vi.fn();
        store.onChange('bar', cb);
        store.set('bar', 42);

        expect(cb).not.toHaveBeenCalled();
      });

      it('should return a function that unsubscribes the listener when called', () => {
        const cb = vi.fn();
        const unsubscribe = store.onChange('foo', cb);
        unsubscribe();
        store.set('foo', 'again');
        expect(cb).not.toHaveBeenCalled();
      });
    });

    it('should throw an error when calling #getUniqueIDFromEngine', () => {
      const baseStore = createBaseStore({});
      expect(() =>
        baseStore.getUniqueIDFromEngine(buildFakeCommerceEngine({}))
      ).toThrow(
        'getUniqueIDFromEngine not implemented at the base store level.'
      );
    });
  });

  describe('#getFacetElements', () => {
    it('should return only elements that are in the document', async () => {
      const inDoc = document.createElement('div');
      inDoc.setAttribute('facet-id', 'in-doc');
      document.body.appendChild(inDoc);
      const notInDoc = document.createElement('div');
      const store = {
        state: {
          facets: {},
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          facetElements: [inDoc, notInDoc],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const {getFacetElements} = await import('./store');
      const result = getFacetElements(store as never);
      expect(result).toContain(inDoc);
      expect(result).not.toContain(notInDoc);
      document.body.removeChild(inDoc);
    });

    it('should return an empty array when no elements are in the document', async () => {
      const notInDoc1 = document.createElement('div');
      notInDoc1.setAttribute('facet-id', 'not-in-doc-1');
      const notInDoc2 = document.createElement('div');
      notInDoc2.setAttribute('facet-id', 'not-in-doc-2');
      const store = {
        state: {
          facets: {},
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          facetElements: [notInDoc1, notInDoc2],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const {getFacetElements} = await import('./store');
      const result = getFacetElements(store as never);
      expect(result).toEqual([]);
    });

    it('should return all elements when all are in the document', async () => {
      const inDoc1 = document.createElement('div');
      inDoc1.setAttribute('facet-id', 'in-doc-1');
      const inDoc2 = document.createElement('div');
      inDoc2.setAttribute('facet-id', 'in-doc-2');
      document.body.appendChild(inDoc1);
      document.body.appendChild(inDoc2);
      const store = {
        state: {
          facets: {},
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          facetElements: [inDoc1, inDoc2],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const {getFacetElements} = await import('./store');
      const result = getFacetElements(store as never);
      expect(result).toEqual([inDoc1, inDoc2]);
      document.body.removeChild(inDoc1);
      document.body.removeChild(inDoc2);
    });
  });

  describe('#registerFacet', () => {
    it('should add a new facet element and data to the store for the given facet type and facetId', () => {
      const element = document.createElement('div');
      element.setAttribute('facet-id', 'facet1');
      const store = {
        state: {
          facets: {} as Record<string, never>,
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          facetElements: [],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const data = {
        facetId: 'facet1',
        element,
        label: () => 'label1',
        isHidden: () => false,
        format: () => 'formatted',
      };
      registerFacet(store, 'facets', data);
      expect(store.state.facets.facet1).toBe(data);
      expect(store.state.facetElements).toContain(element);
    });

    it('should not add the element when it has the is-refine-modal attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('facet-id', 'facet2');
      element.setAttribute('is-refine-modal', '');
      const store = {
        state: {
          facets: {} as Record<string, never>,
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          facetElements: [],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const data = {
        facetId: 'facet2',
        element,
        label: () => 'label2',
        isHidden: () => false,
        format: () => 'formatted',
      };
      registerFacet(store, 'facets', data);
      expect(store.state.facets.facet2).toBeUndefined();
      expect(store.state.facetElements).not.toContain(element);
    });

    it('should replace an existing facet element with the same facetId', () => {
      const oldElement = document.createElement('div');
      oldElement.setAttribute('facet-id', 'facet3');
      const newElement = document.createElement('div');
      newElement.setAttribute('facet-id', 'facet3');
      const store = {
        state: {
          facets: {
            facet3: {
              facetId: 'facet3',
              element: oldElement,
              label: () => 'label3',
              isHidden: () => false,
              format: () => 'formatted',
            },
          },
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          facetElements: [oldElement],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const data = {
        facetId: 'facet3',
        element: newElement,
        label: () => 'label3',
        isHidden: () => false,
        format: () => 'formatted',
      };
      registerFacet(store, 'facets', data);
      expect(store.state.facets.facet3).toBe(data);
      expect(store.state.facetElements).not.toContain(oldElement);
      expect(store.state.facetElements).toContain(newElement);
    });

    it('should add facet data to the correct facet type in the store', () => {
      const element = document.createElement('div');
      element.setAttribute('facet-id', 'facet4');
      const store = {
        state: {
          facets: {},
          numericFacets: {} as Record<string, never>,
          dateFacets: {},
          categoryFacets: {},
          facetElements: [],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };
      const data = {
        facetId: 'facet4',
        element,
        label: () => 'label4',
        isHidden: () => false,
        format: () => 'formatted',
      };
      registerFacet(store, 'numericFacets', data);
      expect(store.state.numericFacets.facet4).toBe(data);
      expect(store.state.facetElements).toContain(element);
    });
  });

  describe('#setLoadingFlag', () => {
    it('should add the given loading flag to the #state.loadingFlags array of the given CommonStore object', () => {
      const store = {
        state: {
          loadingFlags: ['flag1', 'flag2'],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };

      setLoadingFlag(store, 'flag3');
      expect(store.state.loadingFlags).toEqual(['flag1', 'flag2', 'flag3']);
    });

    it('should allow setting the same #loadingFlag multiple times', () => {
      const store = {
        state: {
          loadingFlags: ['flag1', 'flag2'],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };

      setLoadingFlag(store, 'flag2');
      expect(store.state.loadingFlags).toEqual(['flag1', 'flag2', 'flag2']);
    });
  });

  describe('#unsetLoadingFlag', () => {
    it('should remove every string in #store.state.loadingFlags that equals the given #loadingFlag', () => {
      const store = {
        state: {
          loadingFlags: ['flag1', 'flag2', 'flag3', 'flag2'],
        },
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn(),
      };

      unsetLoadingFlag(store, 'flag2');
      expect(store.state.loadingFlags).toEqual(['flag1', 'flag3']);
    });
  });

  describe('#waitUntilAppLoaded', () => {
    it('should call the callback and not call the store onChange when loadingFlags is empty in the store', () => {
      const store = {
        state: {loadingFlags: []},
        onChange: vi.fn(),
      };
      const cb = vi.fn();

      waitUntilAppLoaded(store as never, cb);

      expect(cb).toHaveBeenCalledOnce();
      expect(store.onChange).not.toHaveBeenCalled();
    });

    it('should call the callback through the store onChange when loadingFlags becomes empty', () => {
      let listener: ((flags: string[]) => void) | undefined;
      const store = {
        state: {loadingFlags: ['flag1']},
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn((_, cb) => {
          listener = cb;
        }),
      };
      const cb = vi.fn();

      waitUntilAppLoaded(store as never, cb);

      expect(cb).not.toHaveBeenCalled();
      expect(store.onChange).toHaveBeenCalledExactlyOnceWith(
        'loadingFlags',
        expect.any(Function)
      );

      // Simulate loadingFlags becoming empty
      listener!([]);

      expect(cb).toHaveBeenCalledOnce();
    });

    it('should not execute the callback when loadingFlags does not become empty', () => {
      let listener: ((flags: string[]) => void) | undefined;
      const store = {
        state: {loadingFlags: ['flag1']},
        get: vi.fn(),
        set: vi.fn(),
        onChange: vi.fn((_, cb) => {
          listener = cb;
        }),
      };
      const cb = vi.fn();

      waitUntilAppLoaded(store as never, cb);
      expect(cb).not.toHaveBeenCalled();

      // Simulate loadingFlags changing but remaining non-empty
      listener!(['flag2']);
      expect(cb).not.toHaveBeenCalled();
    });
  });
});
