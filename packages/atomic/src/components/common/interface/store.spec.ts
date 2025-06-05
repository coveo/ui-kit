import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {describe, beforeEach, it, expect, vi} from 'vitest';
import {
  unsetLoadingFlag,
  setLoadingFlag,
  createAppLoadedListener,
  createBaseStore,
  BaseStore,
} from './store';

describe('store', () => {
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
      store.state.loadingFlags = [];

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

  // Only used in Stencil components at the moment.
  describe('#registerFacet', () => {
    it('TODO', () => {});
  });

  // Only used in Stencil components at the moment.
  describe('#getFacetElements', () => {
    it('TODO', () => {});
  });

  // Only used in Stencil components at the moment.
  describe('#waitUntilAppLoaded', () => {
    it('TODO', () => {});
  });
});
