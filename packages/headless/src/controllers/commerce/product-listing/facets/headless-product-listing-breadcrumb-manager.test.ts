import {
  AnyFacetResponse,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
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
    engine.state.facetOrder.push(facetId);
    engine.state.commerceFacetSet[facetId] = {
      request: buildMockCommerceFacetRequest(),
    };
    engine.state.productListing.facets.push({facetId, ...restOfResponse});
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

  it('exposes #subscribe method', () => {
    expect(breadcrumbManager.subscribe).toBeTruthy();
  });

  it('uses #facetResponseSelector to get the facets', () => {
    deselectFirstBreadcrumb();

    expect(breadcrumbManager.state.hasBreadcrumbs).toBeTruthy();
  });

  it('dispatches #fetchProductListing when selecting a breadcrumb value', () => {
    deselectFirstBreadcrumb();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  function deselectFirstBreadcrumb() {
    breadcrumbManager.state.facetBreadcrumbs[0].values[0].deselect();
  }
});
