import {fetchProductListing} from '../../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../../features/commerce/product-listing/product-listing-slice';
import {configurationReducer as configuration} from '../../../../../../features/configuration/configuration-slice';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {CommerceAppState} from '../../../../../../state/commerce-app-state';
import {
  MockCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../../test';
import {buildMockCommerceState} from '../../../../../../test/mock-commerce-state';
import {buildMockNumericFacetSlice} from '../../../../../../test/mock-numeric-facet-slice';
import {
  ProductListingNumericFacet,
  ProductListingNumericFacetOptions,
  buildProductListingNumericFacet,
} from './headless-product-listing-numeric-facet';

describe('ProductListingNumericFacet', () => {
  const facetId = 'ec_price_id';
  let options: ProductListingNumericFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let productListingNumericFacet: ProductListingNumericFacet;

  function initProductListingNumericFacet() {
    engine = buildMockCommerceEngine({state});
    productListingNumericFacet = buildProductListingNumericFacet(engine, {
      options,
    });
  }

  function findDispatchedFetchProductListingAction() {
    return engine.findAsyncAction(fetchProductListing.pending);
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'ec_price',
      generateAutomaticRanges: true,
    };
    state = buildMockCommerceState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();
    initProductListingNumericFacet();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      configuration,
      productListing,
      numericFacetSet,
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      productListingNumericFacet.toggleSelect({
        start: 0,
        end: 1,
        endInclusive: true,
        numberOfResults: 1,
        state: 'selected',
      });

      expect(findDispatchedFetchProductListingAction).toBeTruthy();
    });

    it('when state is "selected", dispatches #logFacetDeselect', () => {
      productListingNumericFacet.toggleSelect({
        start: 0,
        end: 1,
        endInclusive: true,
        numberOfResults: 1,
        state: 'selected',
      });

      const expectedAnalyticsActionType = logFacetDeselect({
        facetId,
        facetValue: '',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });

    it('when state is "idle", dispatches #logFacetSelect', () => {
      productListingNumericFacet.toggleSelect({
        start: 0,
        end: 1,
        endInclusive: true,
        numberOfResults: 1,
        state: 'idle',
      });

      const expectedAnalyticsActionType = logFacetSelect({
        facetId,
        facetValue: '',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });
  });

  it('#deselectAll dispatches #fetchProductListing & logFacetClearAll', () => {
    productListingNumericFacet.deselectAll();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();

    const expectedAnalyticsActionType = logFacetClearAll('').pending.type;

    expect(engine.actions.find((a) => a.type === expectedAnalyticsActionType));
  });
});
