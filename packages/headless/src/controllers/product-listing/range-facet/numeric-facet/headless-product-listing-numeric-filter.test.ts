import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {
  buildMockProductListingEngine,
  MockedProductListingEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {
  buildNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-product-listing-numeric-filter';

jest.mock('../../../../features/product-listing/product-listing-actions');

describe('numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: ProductListingAppState;
  let engine: MockedProductListingEngine;
  let numericFacet: NumericFilter;

  beforeEach(() => {
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockProductListingState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    engine = buildMockProductListingEngine(state);
    engine.dispatch = jest.fn().mockReturnValue(Promise.resolve());
    numericFacet = buildNumericFilter(engine, {options, initialState});
  });

  describe('#setRange', () => {
    it('dispatches #fetchProductListing', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.setRange(value);
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#clear', () => {
    it('dispatches #fetchProductListing', () => {
      numericFacet.clear();
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });
});
