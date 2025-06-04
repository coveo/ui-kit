import {describe, beforeEach, it, expect, vi} from 'vitest';
import {
  createStore,
  CommonStore,
  createBaseStore,
  unsetLoadingFlag,
  setLoadingFlag,
} from './store';

vi.mock('./store', {spy: true});

describe('#createStore', () => {
  let state: Record<string, unknown> & {
    foo: string;
    bar: number;
  };
  let store: CommonStore<typeof state>;

  beforeEach(() => {
    state = {foo: 'hello', bar: 42};
    store = createStore(state);
  });

  it('should return a #state object that proxies the initialState record', () => {
    expect(store.state).toEqual(state);

    store.state.foo = 'world';
    expect(state.foo).toBe('world');

    state.bar = 100;
    expect(store.state.bar).toBe(100);
  });

  it('should return a #get function that can retrieve the value of a given property in the proxied #state', () => {
    expect(store.get('foo')).toBe('hello');
    expect(store.get('bar')).toBe(42);
  });

  it('should return a #set function that can update the value of a given property in the proxied #state', () => {
    store.set('foo', 'world');
    expect(store.state.foo).toBe('world');
    store.set('bar', 100);
    expect(store.state.bar).toBe(100);
  });

  it('should return an #onChange function', () => {
    expect(store.onChange).toBe(expect.any(Function));
  });

  describe('when calling the #onChange function', () => {
    it('should add a change listener on the given property in the proxied #state', () => {
      const cb = vi.fn();
      store.onChange('foo', cb);
      store.set('foo', 'changed');

      expect(cb).toHaveBeenCalledWith('changed');
    });

    it('should allow adding multiple listeners on the same property in the proxied #state', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      store.onChange('foo', cb1);
      store.onChange('foo', cb2);
      store.set('foo', 'changed');

      expect(cb1).toHaveBeenCalledWith('changed');
      expect(cb2).toHaveBeenCalledWith('changed');
    });

    it('should not execute listener callback when proxied state property is set to its current value', () => {
      const cb = vi.fn();
      store.onChange('bar', cb);
      store.set('bar', 42);

      expect(cb).not.toHaveBeenCalled();
    });

    it('should return a function that removes the listener when called', () => {
      const cb = vi.fn();
      const unsubscribe = store.onChange('foo', cb);
      unsubscribe();
      store.set('foo', 'again');
      expect(cb).not.toHaveBeenCalled();
    });
  });
});

describe('createBaseStore', () => {
  it('should throw on getUniqueIDFromEngine', () => {
    const store = createBaseStore({foo: 1});
    expect(() => store.getUniqueIDFromEngine({})).toThrow(
      'getUniqueIDFromEngine not implemented at the base store level.'
    );
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
    } as CommonStore<{loadingFlags: string[]}>;

    unsetLoadingFlag(store, 'flag2');
    expect(store.state.loadingFlags).toEqual(['flag1', 'flag3']);
  });
});

describe('#setLoadingFlag', () => {
  it('should add the given #loadingFlag to #store.state.loadingFlags', () => {
    const store = {
      state: {
        loadingFlags: ['flag1', 'flag2'],
      },
      get: vi.fn(),
      set: vi.fn(),
      onChange: vi.fn(),
    } as CommonStore<{loadingFlags: string[]}>;

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
    } as CommonStore<{loadingFlags: string[]}>;

    setLoadingFlag(store, 'flag2');
    expect(store.state.loadingFlags).toEqual(['flag1', 'flag2', 'flag2']);
  });
});

describe('#createBaseStore', () => {
  it('should return an object that contains the return value of #createStore with the addition of a #getUniqueIDFromEngine function', () => {
    const createStoreSpy = vi.mocked(createStore);

    const baseStore = createBaseStore({foo: 1});

    console.log('baseStore', baseStore);
    console.log(createStoreSpy.mock);

    expect(createStoreSpy).toHaveBeenCalledWith({foo: 1});
    expect(baseStore).toBe({
      ...createStoreSpy.mock.results[0].value,
      getUniqueIDFromEngine: expect.any(Function),
    });
  });
});
