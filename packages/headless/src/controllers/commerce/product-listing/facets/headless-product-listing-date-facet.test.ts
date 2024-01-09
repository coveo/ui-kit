import {Action} from '@reduxjs/toolkit';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceDateFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceDateFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {CommerceDateFacet} from '../../facets/core/date/headless-commerce-date-facet';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {buildProductListingDateFacet} from './headless-product-listing-date-facet';

describe('ProductListingDateFacet', () => {
  const facetId: string = 'date_facet_id';
  const start = '2023-01-01';
  const end = '2024-01-01';
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceDateFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildProductListingDateFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceDateFacetResponse({facetId}),
    ];
  }

  const expectContainAction = (action: Action) => {
    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: action.type,
      })
    );
  };

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

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #fetchproductlisting', () => {
      const facetValue = buildMockCommerceDateFacetValue({start, end});
      facet.toggleExclude(facetValue);

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      facet.deselectAll();

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches #fetchProductListing', () => {
      facet.showMoreValues();

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #fetchProductListing', () => {
      facet.showLessValues();

      expectContainAction(fetchProductListing.pending);
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
