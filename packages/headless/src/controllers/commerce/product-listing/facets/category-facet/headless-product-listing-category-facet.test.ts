import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../features/commerce/product-listing/product-listing-slice';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../../../features/facets/category-facet-set/category-facet-set-slice';
import {logFacetClearAll} from '../../../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
} from '../../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {
  ProductListingCategoryFacet,
  buildProductListingCategoryFacet,
} from './headless-product-listing-category-facet';

describe('ProductListingCategoryFacet', () => {
  let engine: MockCommerceEngine;
  let commerceCategoryFacet: ProductListingCategoryFacet;

  function initProductListingCategoryFacet() {
    engine = buildMockCommerceEngine();

    commerceCategoryFacet = buildProductListingCategoryFacet(engine, {
      options: {field: 'ec_category', facetId: 'ec_category'},
    });
  }

  function findDispatchedFetchProductListingAction() {
    return engine.findAsyncAction(fetchProductListing.pending);
  }

  beforeEach(() => {
    initProductListingCategoryFacet();
  });
  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      productListing,
      categoryFacetSet,
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      commerceCategoryFacet.toggleSelect({
        children: [],
        isLeafValue: true,
        moreValuesAvailable: false,
        numberOfResults: 0,
        path: [],
        state: 'selected',
        value: '',
      });
      expect(findDispatchedFetchProductListingAction()).toBeTruthy();
    });

    it('when state is "selected", dispatches #logFacetDeselect', () => {
      commerceCategoryFacet.toggleSelect({
        children: [],
        isLeafValue: true,
        moreValuesAvailable: false,
        numberOfResults: 0,
        path: [],
        state: 'selected',
        value: '',
      });

      const expectedAnalyticsActionType = logFacetDeselect({
        facetId: 'ec_category',
        facetValue: '',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });

    it('when state is "idle", dispatches #logFacetSelect', () => {
      commerceCategoryFacet.toggleSelect({
        children: [],
        isLeafValue: true,
        moreValuesAvailable: false,
        numberOfResults: 0,
        path: [],
        state: 'idle',
        value: '',
      });

      const expectedAnalyticsActionType = logFacetSelect({
        facetId: '',
        facetValue: '',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });
  });

  it('#deselectAll dispatches #fetchProductListing & #logFacetClearAll', () => {
    commerceCategoryFacet.deselectAll();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();

    const expectedAnalyticsActionType = logFacetClearAll('').pending.type;

    expect(engine.actions.find((a) => a.type === expectedAnalyticsActionType));
  });

  it('#showMoreValues dispatches #fetchProductListing & #logFacetShowMore', () => {
    commerceCategoryFacet.showMoreValues();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();

    const expectedAnalyticsActionType = logFacetShowMore('').pending.type;

    expect(engine.actions.find((a) => a.type === expectedAnalyticsActionType));
  });

  it('#showLessValues dispatches #fetchProductListing & #logFacetShowLess', () => {
    commerceCategoryFacet.showLessValues();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();

    const expectedAnalyticsActionType = logFacetShowLess('').pending.type;

    expect(engine.actions.find((a) => a.type === expectedAnalyticsActionType));
  });
});
