import {describe, expect, test, vi} from 'vitest';
import {CommonStore, createAppLoadedListener, unsetLoadingFlag} from './store';

describe('#createAppLoadedListener', () => {
  let store: CommonStore<{loadingFlags: string[]}>;
  let callback: (isAppLoaded: boolean) => void;

  beforeEach(() => {
    vi.resetAllMocks();

    store = {
      state: {loadingFlags: ['flag1', 'flag2']},
      onChange: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
    };
    callback = vi.fn();
  });

  test("should call #store.onChange with 'loadingFlags' and a callback", () => {
    createAppLoadedListener(store, callback);

    expect(store.onChange).toHaveBeenCalledOnce();
    expect(store.onChange).toHaveBeenCalledWith(
      'loadingFlags',
      expect.any(Function)
    );
  });

  test("should execute #callback with 'false' when #store.loadingFlags is not empty", () => {
    createAppLoadedListener(store, callback);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(false);
  });

  test("should execute #callback with 'true' when #store.loadingFlags is empty", () => {
    store.state.loadingFlags = [];
    createAppLoadedListener(store, callback);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(true);
  });
});

describe('#unsetLoadingFlag', () => {
  let store: CommonStore<{loadingFlags: string[]}>;
  let flag: string;

  beforeEach(() => {
    vi.resetAllMocks();

    store = {
      state: {loadingFlags: ['flag1', 'flag2']},
      onChange: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
    };
    flag = 'flag1';
  });

  test('should remove #flag from #store.loadingFlags', () => {
    unsetLoadingFlag(store, flag);

    expect(store.state.loadingFlags).toEqual(['flag2']);
  });
});
