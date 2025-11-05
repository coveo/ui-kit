import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {describe, expect, it, vi} from 'vitest';
import {createRecsStore} from './store';

vi.mock('@coveo/headless/recommendation', {spy: true});

describe('RecsStore', () => {
  it('should set and unset loading flags correctly', () => {
    const store = createRecsStore();
    const loadingFlag = 'test-loading-flag';

    expect(store.state.loadingFlags).not.toContain(loadingFlag);

    store.setLoadingFlag(loadingFlag);
    expect(store.state.loadingFlags).toContain(loadingFlag);

    store.unsetLoadingFlag(loadingFlag);
    expect(store.state.loadingFlags).not.toContain(loadingFlag);
  });

  it('should return unique ID from engine', () => {
    const mockEngine = {
      state: {
        recommendation: {
          searchUid: 'test-search-uid',
        },
      },
    } as unknown as RecommendationEngine;

    const store = createRecsStore();

    expect(store.getUniqueIDFromEngine(mockEngine)).toBe('test-search-uid');
  });

  it('should add fields to include', () => {
    const store = createRecsStore();

    expect(store.state.fieldsToInclude).toEqual([]);

    store.addFieldsToInclude(['field1', 'field2']);
    expect(store.state.fieldsToInclude).toEqual(['field1', 'field2']);

    store.addFieldsToInclude(['field3']);
    expect(store.state.fieldsToInclude).toEqual(['field1', 'field2', 'field3']);
  });

  it('should initialize with correct default state', () => {
    const store = createRecsStore();

    expect(store.state).toEqual({
      loadingFlags: [],
      iconAssetsPath: '',
      fieldsToInclude: [],
      resultList: undefined,
    });
  });
});
