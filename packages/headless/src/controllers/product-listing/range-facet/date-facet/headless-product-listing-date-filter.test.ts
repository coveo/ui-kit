import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions.js';
import {ProductListingAppState} from '../../../../state/product-listing-app-state.js';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../../test.js';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state.js';
import {
  buildDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-product-listing-date-filter.js';

describe('date filter', () => {
  const facetId = '1';
  let options: DateFilterOptions;
  let initialState: DateFilterInitialState | undefined;
  let state: ProductListingAppState;
  let engine: MockProductListingEngine;
  let dateFacet: DateFilter;
  beforeEach(() => {
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockProductListingState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    engine = buildMockProductListingEngine({state});
    dateFacet = buildDateFilter(engine, {options, initialState});
  });

  describe('#setRange', () => {
    it('dispatches #fetchProductListing', () => {
      const value = buildMockDateFacetValue();
      dateFacet.setRange(value);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#clear', () => {
    it('dispatches #fetchProductListing', () => {
      dateFacet.clear();
      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });
});
