import {Action} from '@reduxjs/toolkit';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceNumericFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceNumericFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {CommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {CommerceNumericFacet} from '../../facets/core/numeric/headless-commerce-numeric-facet';
import {buildProductListingNumericFacet} from './headless-product-listing-numeric-facet';

describe('ProductListingNumericFacet', () => {
  const facetId: string = 'numeric_facet_id';
  const start = 0;
  const end = 100;
  let options: CommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceNumericFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildProductListingNumericFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceNumericFacetResponse({facetId}),
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
      const facetValue = buildMockCommerceNumericFacetValue({start, end});
      facet.toggleSelect(facetValue);

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #fetchproductlisting', () => {
      const facetValue = buildMockCommerceNumericFacetValue({start, end});
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
});
