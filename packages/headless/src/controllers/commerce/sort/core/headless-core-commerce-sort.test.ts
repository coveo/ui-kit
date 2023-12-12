import {Action} from '@reduxjs/toolkit';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {applySort} from '../../../../features/commerce/sort/sort-actions';
import {sortReducer} from '../../../../features/commerce/sort/sort-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildRelevanceSortCriterion,
  buildCoreSort,
  Sort,
  SortBy,
} from './headless-core-commerce-sort';

describe('commerce core sort', () => {
  let sort: Sort;
  let engine: MockCommerceEngine;
  const fetchResultsActionCreator = fetchProductListing;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    sort = buildCoreSort(engine, {
      fetchResultsActionCreator,
    });
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

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
      fetchResultsActionCreator,
    });
    expectContainAction(applySort);
  });

  describe('#sortBy', () => {
    beforeEach(() => {
      sort.sortBy(buildRelevanceSortCriterion());
    });

    it('dispatches #applySort', () => {
      expectContainAction(applySort);
    });

    it('dispatches #fetchResultsActionCreator', () => {
      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('when sort is populated with non-default sort', () => {
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
      sort = buildCoreSort(engine, {fetchResultsActionCreator});
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
