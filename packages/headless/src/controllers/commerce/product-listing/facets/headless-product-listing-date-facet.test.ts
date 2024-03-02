import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceDateFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceDateFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {DateFacet} from '../../core/facets/date/headless-commerce-date-facet';
import {
  CommerceFacetOptions,
  DateRangeRequest,
} from '../../core/facets/headless-core-commerce-facet';
import {buildProductListingDateFacet} from './headless-product-listing-date-facet';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('ProductListingDateFacet', () => {
  const facetId: string = 'date_facet_id';
  const start = '2023-01-01';
  const end = '2024-01-01';
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: DateFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildProductListingDateFacet(engine, options);
  }

  function setFacetRequest(
    config: Partial<CommerceFacetRequest<DateRangeRequest>> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceDateFacetResponse({facetId}),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
    };

    state = buildMockCommerceState();
    setFacetRequest();

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
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleSelect(facetValue);
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #fetchproductlisting', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
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

  describe('#state', () => {
    it('#state.values uses #facetResponseSelector', () => {
      expect(facet.state.facetId).toEqual(
        state.productListing.facets[0].facetId
      );
    });

    it('#state.isLoading uses #isFacetLoadingResponseSelector', () => {
      state.productListing.isLoading = true;
      expect(facet.state.isLoading).toBe(true);
    });
  });
});
