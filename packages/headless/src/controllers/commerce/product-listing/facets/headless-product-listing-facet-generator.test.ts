import {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {
  buildProductListingFacetGenerator,
  ProductListingFacetGenerator,
} from './headless-product-listing-facet-generator';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('ProductListingFacetGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let facetGenerator: ProductListingFacetGenerator;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initProductListingFacetGenerator() {
    facetGenerator = buildProductListingFacetGenerator(engine);
  }

  function setFacetState(config: {facetId: string; type: FacetType}[] = []) {
    for (const facet of config) {
      state.facetOrder.push(facet.facetId);
      state.commerceFacetSet[facet.facetId] = {
        request: buildMockCommerceFacetRequest({
          facetId: facet.facetId,
          type: facet.type,
        }),
      };
      state.facetSearchSet[facet.facetId] = buildMockFacetSearch();
      state.categoryFacetSearchSet[facet.facetId] =
        buildMockCategoryFacetSearch();
    }
  }

  beforeEach(() => {
    jest.resetAllMocks();

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initProductListingFacetGenerator();
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('generated regular facet controller dispatches #fetchProductListing', () => {
    setFacetState([{facetId: 'regular_facet_id', type: 'regular'}]);
    initProductListingFacetGenerator();

    facetGenerator.facets[0].deselectAll();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('generated regular numeric facet controller dispatches #fetchProductListing', () => {
    setFacetState([{facetId: 'numeric_facet_id', type: 'numericalRange'}]);
    initProductListingFacetGenerator();

    facetGenerator.facets[0].deselectAll();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('generated date facet controller dispatches #fetchProductListing', () => {
    setFacetState([{facetId: 'date_facet_id', type: 'dateRange'}]);

    facetGenerator.facets[0].deselectAll();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('generated category facet controller dispatches #fetchProductListing', () => {
    setFacetState([{facetId: 'category_facet_id', type: 'hierarchical'}]);

    facetGenerator.facets[0].deselectAll();

    expect(fetchProductListing).toHaveBeenCalled();
  });
});
