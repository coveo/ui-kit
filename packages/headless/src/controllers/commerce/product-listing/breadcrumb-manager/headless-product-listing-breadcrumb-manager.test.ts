import {stateKey} from '../../../../app/state-key';
import {
  AnyFacetResponse,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {BreadcrumbManager} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';
import {buildProductListingBreadcrumbManager} from './headless-product-listing-breadcrumb-manager';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('product listing breadcrumb manager', () => {
  let engine: MockedCommerceEngine;
  let breadcrumbManager: BreadcrumbManager;

  const facetId = 'some_facet_id';
  const breadcrumb = {
    value: 'Corp Corp',
    state: 'selected',
  } as RegularFacetValue;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initBreadcrumbManager() {
    breadcrumbManager = buildProductListingBreadcrumbManager(engine);
  }

  function setFacetsState({facetId, ...restOfResponse}: AnyFacetResponse) {
    engine[stateKey].facetOrder.push(facetId);
    engine[stateKey].commerceFacetSet[facetId] = {
      request: buildMockCommerceFacetRequest(),
    };
    engine[stateKey].productListing.facets.push({facetId, ...restOfResponse});
  }

  beforeEach(() => {
    jest.resetAllMocks();

    initEngine();
    initBreadcrumbManager();

    setFacetsState(
      buildMockCommerceRegularFacetResponse({
        facetId,
        values: [breadcrumb],
      })
    );
  });

  it('initializes', () => {
    expect(breadcrumbManager).toBeTruthy();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing,
    });
  });

  it('exposes #subscribe method', () => {
    expect(breadcrumbManager.subscribe).toBeTruthy();
  });

  it('uses #facetResponseSelector to get the facets', () => {
    deselectBreadcrumb();

    expect(breadcrumbManager.state.hasBreadcrumbs).toBeTruthy();
  });

  it('dispatches #fetchProductListing when selecting a breadcrumb value', () => {
    deselectBreadcrumb();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  function deselectBreadcrumb() {
    breadcrumbManager.state.facetBreadcrumbs[0].values[0].deselect();
  }
});
