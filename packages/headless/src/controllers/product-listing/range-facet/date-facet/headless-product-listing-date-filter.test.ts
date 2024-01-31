import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {MockProductListingEngine} from '../../../../test/mock-engine';
import {buildMockProductListingEngine} from '../../../../test/mock-engine';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {
  buildDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-product-listing-date-filter';

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
