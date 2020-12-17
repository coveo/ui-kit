import {
  buildMockSearchAppEngine,
  createMockState,
  MockEngine,
} from '../../test';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetValue} from '../../test/mock-facet-value';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value';
import {buildMockDateFacetResponse} from '../../test/mock-date-facet-response';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockNumericFacetValue} from '../../test/mock-numeric-facet-value';
import {buildMockNumericFacetResponse} from '../../test/mock-numeric-facet-response';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetValue} from '../../test/mock-category-facet-value';
import {buildMockCategoryFacetResponse} from '../../test/mock-category-facet-response';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice';

describe('headless breadcrumb manager', () => {
  const facetId = 'abc123';
  let engine: MockEngine<SearchAppState>;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  beforeEach(() => {
    state = createMockState();
    engine = buildMockSearchAppEngine({state});
    breadcrumbManager = buildBreadcrumbManager(engine);
  });

  it('#state gets facet breadcrumbs correctly', () => {
    state.facetSet[facetId] = buildMockFacetRequest({facetId});
    const mockValue = buildMockFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockFacetResponse({facetId, values: [mockValue]}),
    ];
    const facetBreadcrumbs = breadcrumbManager.state.facetBreadcrumbs;
    expect(facetBreadcrumbs?.[0]?.values[0].value).toBe(mockValue);
  });

  it('#state gets date facet breadcrumbs correctly', () => {
    state.dateFacetSet[facetId] = buildMockDateFacetRequest({facetId});
    const mockValue = buildMockDateFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values: [mockValue]}),
    ];
    const facetBreadcrumbs = breadcrumbManager.state.dateFacetBreadcrumbs;
    expect(facetBreadcrumbs?.[0]?.values[0].value).toBe(mockValue);
  });

  it('#state gets numeric facet breadcrumbs correctly', () => {
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest({facetId});
    const mockValue = buildMockNumericFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [mockValue]}),
    ];
    const facetBreadcrumbs = breadcrumbManager.state.numericFacetBreadcrumbs;
    expect(facetBreadcrumbs?.[0]?.values[0].value).toBe(mockValue);
  });

  it('#state gets category facet breadcrumbs correctly', () => {
    const otherFacetId = 'def456';
    const request1 = buildMockCategoryFacetRequest({facetId});
    const request2 = buildMockCategoryFacetRequest({facetId: otherFacetId});

    state.categoryFacetSet = {
      [facetId]: buildMockCategoryFacetSlice({request: request1}),
      [otherFacetId]: buildMockCategoryFacetSlice({request: request2}),
    };

    const mockValue = buildMockCategoryFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockCategoryFacetResponse({facetId, values: [mockValue]}),
      buildMockCategoryFacetResponse({
        facetId: otherFacetId,
        values: [mockValue],
      }),
    ];
    const facetBreadcrumbs = breadcrumbManager.state.categoryFacetBreadcrumbs;
    expect(facetBreadcrumbs?.[0].path).toEqual([mockValue]);
    expect(facetBreadcrumbs?.[1].path).toEqual([mockValue]);
  });

  it('hasBreadcrumbs returns true when a facet value is selected', () => {
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest({facetId});
    const mockValue = buildMockNumericFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [mockValue]}),
    ];
    expect(breadcrumbManager.hasBreadcrumbs()).toBe(true);
  });

  it('hasBreadcrumbs returns false when no facet value is selected', () => {
    expect(breadcrumbManager.hasBreadcrumbs()).toBe(false);
  });
});
