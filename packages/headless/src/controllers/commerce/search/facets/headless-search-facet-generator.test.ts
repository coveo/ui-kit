import {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceRegularFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCommerceCategoryFacetResponse,
} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildSearchFacetGenerator,
  SearchFacetGenerator,
} from './headless-search-facet-generator';

describe('SearchFacetGenerator', () => {
  let engine: MockCommerceEngine;
  let facetGenerator: SearchFacetGenerator;

  function initFacetGenerator(facetType: FacetType = 'regular') {
    const facet = {
      facetId: 'regular_facet_id',
      type: facetType,
    };
    const mockState = buildMockCommerceState();
    const facets = [];
    switch (facetType) {
      case 'regular':
        facets.push(
          buildMockCommerceRegularFacetResponse({
            facetId: facet.facetId,
            field: 'some_regular_field',
          })
        );
        break;
      case 'numericalRange':
        facets.push(
          buildMockCommerceNumericFacetResponse({
            facetId: facet.facetId,
            field: 'some_numeric_field',
          })
        );
        break;
      case 'dateRange':
        facets.push(
          buildMockCommerceDateFacetResponse({
            facetId: facet.facetId,
            field: 'some_date_field',
          })
        );
        break;
      case 'hierarchical':
        facets.push(
          buildMockCommerceCategoryFacetResponse({
            facetId: facet.facetId,
            field: 'some_category_field',
          })
        );
        break;
      default:
        break;
    }
    engine = buildMockCommerceEngine({
      state: {
        ...mockState,
        commerceSearch: {
          ...mockState.commerceSearch,
          facets: [
            buildMockCommerceRegularFacetResponse({
              facetId: facet.facetId,
              field: 'some_regular_field',
            }),
          ],
        },
        facetOrder: [facet.facetId],
        commerceFacetSet: {
          [facet.facetId]: {request: buildMockCommerceFacetRequest(facet)},
        },
      },
    });
    facetGenerator = buildSearchFacetGenerator(engine);
  }

  it('exposes #subscribe method', () => {
    initFacetGenerator();
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('generated regular facet controllers dispatch #executeSearch', () => {
    initFacetGenerator('regular');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  });
  it('generated regular numeric facet controllers dispatch #executeSearch', () => {
    initFacetGenerator('numericalRange');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  });

  it('generated date facet controllers dispatch #executeSearch', () => {
    initFacetGenerator('dateRange');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  });

  it('generated category facet controllers dispatch #executeSearch', () => {
    initFacetGenerator('hierarchical');

    facetGenerator.state.facets[0].deselectAll();

    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  });
});
