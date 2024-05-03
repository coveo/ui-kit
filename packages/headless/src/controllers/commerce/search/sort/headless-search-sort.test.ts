import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildRelevanceSortCriterion,
  Sort,
} from '../../core/sort/headless-core-commerce-sort';
import {buildSearchSort} from './headless-search-sort';

jest.mock('../../../../features/commerce/search/search-actions');

describe('commerce search sort', () => {
  let sort: Sort;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    sort = buildSearchSort(engine);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceSearch,
    });
  });

  it('#sortBy dispatches #executeSearch', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    expect(executeSearch).toHaveBeenCalled();
  });
});
