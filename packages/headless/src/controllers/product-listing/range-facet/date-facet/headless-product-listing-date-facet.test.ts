import {configuration} from '../../../../app/common-reducers.js';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions.js';
import {searchReducer as search} from '../../../../features/search/search-slice.js';
import {ProductListingAppState} from '../../../../state/product-listing-app-state.js';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {
  MockProductListingEngine,
  buildMockProductListingEngine,
} from '../../../../test/mock-engine.js';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state.js';
import {
  DateFacet,
  buildDateFacet,
  DateFacetOptions,
} from './headless-product-listing-date-facet.js';

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: ProductListingAppState;
  let engine: MockProductListingEngine;
  let dateFacet: DateFacet;

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockProductListingState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    engine = buildMockProductListingEngine({state});
    dateFacet = buildDateFacet(engine, {options});
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      dateFacetSet,
      facetOptions,
      configuration,
      search,
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      dateFacet.deselectAll();

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#sortBy', () => {
    it('dispatches #fetchProductListing', () => {
      dateFacet.sortBy('descending');

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => DateFacetValue) {
    it('dispatches #fetchProductListing', () => {
      dateFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);
  });
});
