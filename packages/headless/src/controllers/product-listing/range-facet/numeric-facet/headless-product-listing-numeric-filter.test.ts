import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {MockProductListingEngine} from '../../../../test/mock-engine';
import {buildMockProductListingEngine} from '../../../../test/mock-engine';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {
  buildNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-product-listing-numeric-filter';

describe('numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: ProductListingAppState;
  let engine: MockProductListingEngine;
  let numericFacet: NumericFilter;

  beforeEach(() => {
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockProductListingState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    engine = buildMockProductListingEngine({state});
    numericFacet = buildNumericFilter(engine, {options, initialState});
  });

  describe('#setRange', () => {
    it('dispatches #fetchProductListing', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.setRange(value);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#clear', () => {
    it('dispatches #fetchProductListing', () => {
      numericFacet.clear();

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });
});
