import {configuration} from '../../../../app/common-reducers';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {
  MockedProductListingEngine,
  buildMockProductListingEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {
  DateFacet,
  buildDateFacet,
  DateFacetOptions,
} from './headless-product-listing-date-facet';

jest.mock('../../../../features/product-listing/product-listing-actions');

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: ProductListingAppState;
  let engine: MockedProductListingEngine;
  let dateFacet: DateFacet;

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockProductListingState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    engine = buildMockProductListingEngine(state);
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
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      dateFacet.deselectAll();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #fetchProductListing', () => {
      dateFacet.sortBy('descending');

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => DateFacetValue) {
    it('dispatches #fetchProductListing', () => {
      dateFacet.toggleSingleSelect(facetValue());

      expect(fetchProductListing).toHaveBeenCalled();
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
