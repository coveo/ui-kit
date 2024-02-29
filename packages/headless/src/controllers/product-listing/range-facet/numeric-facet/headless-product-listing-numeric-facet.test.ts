import {configuration} from '../../../../app/common-reducers';
import {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {
  MockedProductListingEngine,
  buildMockProductListingEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
} from './headless-product-listing-numeric-facet';

jest.mock('../../../../features/product-listing/product-listing-actions');

describe('numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: ProductListingAppState;
  let engine: MockedProductListingEngine;
  let numericFacet: NumericFacet;

  beforeEach(() => {
    jest.resetAllMocks();
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockProductListingState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    engine = buildMockProductListingEngine(state);
    numericFacet = buildNumericFacet(engine, {options});
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      numericFacetSet,
      configuration,
      search,
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      numericFacet.deselectAll();
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #fetchProductListing', () => {
      numericFacet.sortBy('descending');
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => NumericFacetValue) {
    it('dispatches #fetchProductListing', () => {
      numericFacet.toggleSingleSelect(facetValue());
      expect(fetchProductListing).toHaveBeenCalled();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);
  });
});
