import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {applySort} from '../../../../features/commerce/sort/sort-actions';
import {sortReducer} from '../../../../features/commerce/sort/sort-slice';
import {updatePage} from '../../../../features/pagination/pagination-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildRelevanceSortCriterion,
  buildCoreSort,
  Sort,
  SortBy,
} from './headless-core-commerce-sort';

jest.mock('../../../../features/commerce/sort/sort-actions');
jest.mock('../../../../features/pagination/pagination-actions');
jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('commerce core sort', () => {
  let sort: Sort;
  let engine: MockedCommerceEngine;
  const fetchProductsActionCreator = fetchProductListing;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    sort = buildCoreSort(engine, {
      fetchProductsActionCreator,
    });
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceSort: sortReducer,
    });
  });

  it('dispatches #applySort on load when sort is specified', () => {
    sort = buildCoreSort(engine, {
      initialState: {
        criterion: buildRelevanceSortCriterion(),
      },
      fetchProductsActionCreator,
    });
    expect(applySort).toHaveBeenCalled();
  });

  describe('#sortBy', () => {
    beforeEach(() => {
      sort.sortBy(buildRelevanceSortCriterion());
    });

    it('dispatches #applySort', () => {
      expect(applySort).toHaveBeenCalled();
    });

    it('dispatches #updatePage', () => {
      expect(updatePage).toHaveBeenCalled();
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('when sort is populated with non-default sort', () => {
    const appliedSort = {
      by: SortBy.Fields,
      fields: [{name: 'some_field'}],
    };

    beforeEach(() => {
      engine = buildMockCommerceEngine({
        ...buildMockCommerceState(),
        commerceSort: {
          appliedSort: appliedSort,
          availableSorts: [appliedSort],
        },
      });
      sort = buildCoreSort(engine, {
        fetchProductsActionCreator,
      });
    });

    it('calling #isSortedBy with a criterion equal to the one in state returns true', () => {
      expect(sort.isSortedBy(appliedSort)).toBe(true);
    });

    it('calling #isSortedBy with a criterion different from the one in state returns false', () => {
      const notAppliedSort = {
        by: SortBy.Fields,
        fields: [{name: 'some_other_field'}],
      };
      expect(sort.isSortedBy(notAppliedSort)).toBe(false);
    });

    it('calling #isAvailable with an available criterion returns true', () => {
      expect(sort.isAvailable(appliedSort)).toBe(true);
    });

    it('calling #isAvailable with an unavailable criterion returns false', () => {
      const unavailableSort = {
        by: SortBy.Fields,
        fields: [{name: 'some_other_field'}],
      };
      expect(sort.isAvailable(unavailableSort)).toBe(false);
    });
  });
});
