import {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
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
  buildSearchFacetGenerator,
  SearchFacetGenerator,
} from './headless-search-facet-generator';

jest.mock('../../../../features/commerce/search/search-actions');

describe('SearchFacetGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let facetGenerator: SearchFacetGenerator;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initSearchFacetGenerator() {
    facetGenerator = buildSearchFacetGenerator(engine);
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
    initSearchFacetGenerator();
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('generated regular facet controller dispatches #executeSearch', () => {
    setFacetState([{facetId: 'regular_facet_id', type: 'regular'}]);
    initSearchFacetGenerator();

    facetGenerator.facets[0].deselectAll();
    expect(executeSearch).toHaveBeenCalled();
  });

  it('generated regular numeric facet controller dispatches #executeSearch', () => {
    setFacetState([{facetId: 'numeric_facet_id', type: 'numericalRange'}]);
    initSearchFacetGenerator();

    facetGenerator.facets[0].deselectAll();
    expect(executeSearch).toHaveBeenCalled();
  });

  it('generated date facet controller dispatches #executeSearch', () => {
    setFacetState([{facetId: 'date_facet_id', type: 'dateRange'}]);

    facetGenerator.facets[0].deselectAll();
    expect(executeSearch).toHaveBeenCalled();
  });

  it('generated category facet controllers dispatch #executeSearch', () => {
    setFacetState([{facetId: 'category_facet_id', type: 'hierarchical'}]);

    facetGenerator.facets[0].deselectAll();
    expect(executeSearch).toHaveBeenCalled();
  });
});
