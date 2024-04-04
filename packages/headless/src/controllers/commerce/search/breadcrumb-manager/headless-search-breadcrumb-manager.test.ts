import {
  AnyFacetResponse,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {BreadcrumbManager} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';
import {buildSearchBreadcrumbManager} from './headless-search-breadcrumb-manager';

jest.mock('../../../../features/commerce/search/search-actions');

describe('search breadcrumb manager', () => {
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
    breadcrumbManager = buildSearchBreadcrumbManager(engine);
  }

  function setFacetsState({facetId, ...restOfResponse}: AnyFacetResponse) {
    engine.state.facetOrder.push(facetId);
    engine.state.commerceFacetSet[facetId] = {
      request: buildMockCommerceFacetRequest(),
    };
    engine.state.commerceSearch.facets.push({facetId, ...restOfResponse});
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
      commerceSearch,
    });
  });

  it('exposes #subscribe method', () => {
    expect(breadcrumbManager.subscribe).toBeTruthy();
  });

  it('uses #facetResponseSelector to get the facets', () => {
    deselectBreadcrumb();

    expect(breadcrumbManager.state.hasBreadcrumbs).toBeTruthy();
  });

  it('dispatches #executeSearch when selecting a breadcrumb value', () => {
    deselectBreadcrumb();

    expect(executeSearch).toHaveBeenCalled();
  });

  function deselectBreadcrumb() {
    breadcrumbManager.state.facetBreadcrumbs[0].values[0].deselect();
  }
});
