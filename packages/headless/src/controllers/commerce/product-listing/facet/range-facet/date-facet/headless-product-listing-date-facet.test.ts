import {fetchProductListing} from '../../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../../features/commerce/product-listing/product-listing-slice';
import {configurationReducer as configuration} from '../../../../../../features/configuration/configuration-slice';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {CommerceAppState} from '../../../../../../state/commerce-app-state';
import {
  MockCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../../test';
import {buildMockCommerceState} from '../../../../../../test/mock-commerce-state';
import {buildMockDateFacetSlice} from '../../../../../../test/mock-date-facet-slice';
import {
  ProductListingDateFacet,
  ProductListingDateFacetOptions,
  buildProductListingDateFacet,
} from './headless-product-listing-date-facet';

describe('ProductListingDateFacet', () => {
  const facetId = 'cat_date_added_1';
  let options: ProductListingDateFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let productListingDateFacet: ProductListingDateFacet;

  function initProductListingDateFacet() {
    engine = buildMockCommerceEngine({state});
    productListingDateFacet = buildProductListingDateFacet(engine, {options});
  }

  function findDispatchedFetchProductListingAction() {
    return engine.findAsyncAction(fetchProductListing.pending);
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'cat_date_added',
      generateAutomaticRanges: true,
    };
    state = buildMockCommerceState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();
    initProductListingDateFacet();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      configuration,
      productListing,
      dateFacetSet,
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      productListingDateFacet.toggleSelect({
        start: '2023-01-01',
        end: '2024-01-01',
        endInclusive: false,
        numberOfResults: 1,
        state: 'selected',
      });

      expect(findDispatchedFetchProductListingAction).toBeTruthy();
    });

    it('when state is "selected", dispatches #logFacetDeselect', () => {
      productListingDateFacet.toggleSelect({
        start: '2023-01-01',
        end: '2024-01-01',
        endInclusive: false,
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
      productListingDateFacet.toggleSelect({
        start: '2023-01-01',
        end: '2024-01-01',
        endInclusive: false,
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
    productListingDateFacet.deselectAll();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();

    const expectedAnalyticsActionType = logFacetClearAll('').pending.type;

    expect(engine.actions.find((a) => a.type === expectedAnalyticsActionType));
  });
});
