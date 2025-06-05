import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  createBaseStore,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../common/interface/store';
import {
  createCommerceRecommendationStore,
  CommerceRecommendationStore,
} from './store';

vi.mock('../../common/interface/store', {spy: true});

describe('#createCommerceRecommendationStore', () => {
  let store: CommerceRecommendationStore;

  beforeEach(() => {
    store = createCommerceRecommendationStore();
  });

  it('should call #createBaseStore with the correct arguments', () => {
    expect(store).toBeDefined();
    expect(createBaseStore).toHaveBeenCalledExactlyOnceWith({
      loadingFlags: [],
      iconAssetsPath: '',
      resultList: undefined,
    });
  });

  it('should include the base store in its returned value', () => {
    const createBaseStoreSpy = vi.mocked(createBaseStore);
    const baseStore = createBaseStoreSpy.mock.results[0].value;

    expect(store).toEqual({
      ...baseStore,
      unsetLoadingFlag: expect.any(Function),
      setLoadingFlag: expect.any(Function),
    });
  });

  it('should return a #setLoadingFlag function that calls the core #setLoadingFlag with the correct arguments', () => {
    const createBaseStoreSpy = vi.mocked(createBaseStore);
    const baseStore = createBaseStoreSpy.mock.results[0].value;

    store.setLoadingFlag('testFlag');

    expect(setLoadingFlag).toHaveBeenCalledExactlyOnceWith(
      baseStore,
      'testFlag'
    );
  });

  it('should return an #unsetLoadingFlag function that calls the core #setLoadingFlag with the correct arguments', () => {
    const createBaseStoreSpy = vi.mocked(createBaseStore);
    const baseStore = createBaseStoreSpy.mock.results[0].value;

    store.unsetLoadingFlag('testFlag');

    expect(unsetLoadingFlag).toHaveBeenCalledExactlyOnceWith(
      baseStore,
      'testFlag'
    );
  });
});
