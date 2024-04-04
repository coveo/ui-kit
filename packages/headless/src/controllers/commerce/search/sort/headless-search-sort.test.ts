import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  buildRelevanceSortCriterion,
  Sort,
} from '../../sort/core/headless-core-commerce-sort';
import {buildSearchSort} from './headless-search-sort';

describe('commerce search sort', () => {
  let sort: Sort;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    sort = buildSearchSort(engine);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceSearch,
    });
  });

  it('#sortBy dispatches #executeSearch', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });
});
