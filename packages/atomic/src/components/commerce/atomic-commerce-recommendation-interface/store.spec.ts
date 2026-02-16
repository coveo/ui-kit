import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  createBaseStore,
  setLoadingFlag,
  unsetLoadingFlag,
} from '@/src/components/common/interface/store';
import {
  type CommerceRecommendationStore,
  createCommerceRecommendationStore,
} from './store';

vi.mock('@/src/components/common/interface/store', {spy: true});
const createBaseStoreSpy = vi.mocked(createBaseStore);

describe('#createCommerceRecommendationStore', () => {
  let store: CommerceRecommendationStore;

  beforeEach(() => {
    store = createCommerceRecommendationStore();
  });

  it('should call #createBaseStore with the correct arguments', () => {
    expect(store).toBeDefined();
    expect(createBaseStoreSpy).toHaveBeenCalledExactlyOnceWith({
      loadingFlags: [],
      iconAssetsPath: '',
      resultList: undefined,
    });
  });

  it('should return an object that includes all properties and methods from the base store', () => {
    const baseStore = createBaseStoreSpy.mock.results[0].value;

    expect(store).toEqual({
      ...baseStore,
      unsetLoadingFlag: expect.any(Function),
      setLoadingFlag: expect.any(Function),
    });
  });

  it('should delegate its #setLoadingFlag to the core #setLoadingFlag with the correct arguments', () => {
    const baseStore = createBaseStoreSpy.mock.results[0].value;

    store.setLoadingFlag('testFlag');

    expect(setLoadingFlag).toHaveBeenCalledExactlyOnceWith(
      baseStore,
      'testFlag'
    );
  });

  it('should delegate its #unsetLoadingFlag to the core #unsetLoadingFlag with the correct arguments', () => {
    const baseStore = createBaseStoreSpy.mock.results[0].value;

    store.unsetLoadingFlag('testFlag');

    expect(unsetLoadingFlag).toHaveBeenCalledExactlyOnceWith(
      baseStore,
      'testFlag'
    );
  });
});
