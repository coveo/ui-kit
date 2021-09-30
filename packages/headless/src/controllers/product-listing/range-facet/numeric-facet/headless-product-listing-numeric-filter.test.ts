import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../../test';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {
  buildNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-product-listing-numeric-filter';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';

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
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest();

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
