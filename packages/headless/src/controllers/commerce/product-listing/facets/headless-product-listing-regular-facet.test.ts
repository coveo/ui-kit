import {RegularFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {buildMockFacetSearchResult} from '../../../../test/mock-facet-search-result';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {RegularFacet} from '../../core/facets/regular/headless-commerce-regular-facet';
import {buildProductListingRegularFacet} from './headless-product-listing-regular-facet';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('ProductListingRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CommerceFacetOptions;
  let facet: RegularFacet;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacet() {
    facet = buildProductListingRegularFacet(engine, options);
  }

  function setFacetRequest(config: Partial<RegularFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
    ];
  }

  function setFacetSearch() {
    state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetId,
    };

    state = buildMockCommerceState();
    setFacetRequest();
    setFacetSearch();

    initEngine(state);
    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('adds #productListing reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({productListing});
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #fetchproductlisting', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      facet.deselectAll();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches #fetchProductListing', () => {
      facet.showMoreValues();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #fetchProductListing', () => {
      facet.showLessValues();

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#facetSearch', () => {
    it('#facetSearch.select dispatches #fetchProductListing', () => {
      facet.facetSearch.select(buildMockFacetSearchResult());

      expect(fetchProductListing).toHaveBeenCalled();
    });

    it('#facetSearch.exclude dispatches #fetchProductListing', () => {
      facet.facetSearch.exclude(buildMockFacetSearchResult());

      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#state', () => {
    it('#state.values uses #facetResponseSelector', () => {
      expect(facet.state.facetId).toEqual(
        state.productListing.facets[0].facetId
      );
    });

    it('#state.isLoading uses #isFacetLoadingResponseSelector', () => {
      state.productListing.isLoading = true;
      initFacet();
      expect(facet.state.isLoading).toBe(true);
    });

    it('#state.facetSearch exposes the facet search state', () => {
      expect(facet.state.facetSearch).toBeTruthy();
      expect(facet.state.facetSearch.isLoading).toBe(false);

      state.facetSearchSet[facetId].isLoading = true;
      initFacet();
      expect(facet.state.facetSearch.isLoading).toBe(true);
    });
  });
});
