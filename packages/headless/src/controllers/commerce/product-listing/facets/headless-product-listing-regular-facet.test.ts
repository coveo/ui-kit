import {Action} from '@reduxjs/toolkit';
import {CommerceRegularFacet} from '../../../../commerce.index';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildProductListingRegularFacet,
  ProductListingRegularFacetOptions,
} from './headless-product-listing-regular-facet';

describe('ProductListingRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let options: ProductListingRegularFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceRegularFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildProductListingRegularFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
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

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('exposes a #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  describe('#toggleSelect', () => {
    it('dispatches a #fetchProductListing', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a #fetchproductlisting', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#deselectAll', () => {
    it('dispatches a #fetchProductListing', () => {
      facet.deselectAll();

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches a #fetchProductListing', () => {
      facet.showMoreValues();

      expectContainAction(fetchProductListing.pending);
    });
  });

  describe('#showLessValues', () => {
    it('dispatches a #fetchProductListing', () => {
      facet.showLessValues();

      expectContainAction(fetchProductListing.pending);
    });
  });
});
