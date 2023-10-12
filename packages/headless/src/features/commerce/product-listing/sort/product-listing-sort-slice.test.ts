import {
  getProductListingV2InitialState,
  ProductListingV2State,
} from '../product-listing-state.js';
import {sortReducer} from './product-listing-sort-slice.js';
import {applySort} from './product-listing-sort-actions.js';
import {SortBy} from '../../../sort/sort.js';

describe('product-listing-sort-slice', () => {
  let state: ProductListingV2State;
  beforeEach(() => {
    state = getProductListingV2InitialState();
  });
  it('should have an initial state', () => {
    expect(sortReducer(undefined, {type: 'foo'})).toEqual(
      getProductListingV2InitialState()
    );
  });

  it('sets the applied sort', () => {
    const sort = {
      by: SortBy.Fields,
      fields: [{name: 'some_field'}],
    };
    expect(sortReducer(state, applySort(sort)).sort.appliedSort).toEqual(sort);
  });
});
