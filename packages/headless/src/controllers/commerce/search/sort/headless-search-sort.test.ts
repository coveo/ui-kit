import {Action} from '@reduxjs/toolkit';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  buildRelevanceSortCriterion,
  Sort,
} from '../../sort/core/headless-core-commerce-sort';
import {buildSearchSort} from './headless-search-sort';

describe('headless search sort', () => {
  let sort: Sort;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    sort = buildSearchSort(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceSearch,
    });
  });

  it('sortBy dispatches #fetchProductListing', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    expectContainAction(executeSearch.pending);
  });
});
