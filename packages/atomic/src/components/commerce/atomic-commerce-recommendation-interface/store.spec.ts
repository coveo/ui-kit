import {describe, it, expect, beforeEach} from 'vitest';
import {
  createCommerceRecommendationStore,
  CommerceRecommendationStore,
} from './store';

describe('#createCommerceRecommendationStore', () => {
  let store: CommerceRecommendationStore;

  beforeEach(() => {
    store = createCommerceRecommendationStore();
  });

  it('should initialize with default values', () => {
    expect(store.state.loadingFlags).toEqual([]);
    expect(store.state.iconAssetsPath).toBe('');
    expect(store.state.resultList).toBeUndefined();
  });

  it('should set a loading flag', () => {
    store.setLoadingFlag('fetching');
    expect(store.state.loadingFlags).toContain('fetching');
  });

  it('should not add the same loading flag twice', () => {
    store.setLoadingFlag('fetching');
    store.setLoadingFlag('fetching');
    expect(
      store.state.loadingFlags.filter((f) => f === 'fetching').length
    ).toBe(1);
  });

  it('should unset a loading flag', () => {
    store.setLoadingFlag('fetching');
    store.unsetLoadingFlag('fetching');
    expect(store.state.loadingFlags).not.toContain('fetching');
  });

  it('should do nothing if unsetting a flag that does not exist', () => {
    store.setLoadingFlag('fetching');
    store.unsetLoadingFlag('not-present');
    expect(store.state.loadingFlags).toContain('fetching');
  });

  it('should allow updating iconAssetsPath', () => {
    store.setState({iconAssetsPath: '/icons'});
    expect(store.state.iconAssetsPath).toBe('/icons');
  });

  it('should allow updating resultList', () => {
    const resultList = {results: [], totalCount: 0};
    store.setState({resultList});
    expect(store.state.resultList).toBe(resultList);
  });
});
