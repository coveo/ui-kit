import {Action} from '@reduxjs/toolkit';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer} from '../../../../features/commerce/product-listing/product-listing-slice';
import {applySort} from '../../../../features/commerce/sort/sort-actions';
import {sortReducer} from '../../../../features/commerce/sort/sort-slice';
import {updatePage} from '../../../../features/pagination/pagination-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildRelevanceSortCriterion,
  buildSort,
  Sort,
  SortBy,
} from './headless-product-listing-sort';

describe('headless product-listing-sort', () => {
  let sort: Sort;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    sort = buildSort(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing: productListingV2Reducer,
      commerceSort: sortReducer,
    });
  });

  it('dispatches #applySort on load when sort is specified', () => {
    sort = buildSort(engine, {
      initialState: {
        criterion: buildRelevanceSortCriterion(),
      },
    });
    expectContainAction(applySort);
  });

  it('sortBy dispatches #applySort, #updatePage, and #fetchProductListing', () => {
    sort.sortBy(buildRelevanceSortCriterion());
    expectContainAction(applySort);
    expectContainAction(updatePage);
    expectContainAction(fetchProductListing.pending);
  });

  describe('when sort is populated', () => {
    const appliedSort = {
      by: SortBy.Fields,
      fields: [{name: 'some_field'}],
    };

    beforeEach(() => {
      engine = buildMockCommerceEngine({
        state: {
          ...buildMockCommerceState(),
          commerceSort: {
            appliedSort: appliedSort,
            availableSorts: [appliedSort],
          },
        },
      });
      sort = buildSort(engine);
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
