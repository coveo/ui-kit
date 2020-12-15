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
  CategoryFacetBreadcrumb,
  DateFacetBreadcrumb,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
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
import {deselectAllFacets} from '../../features/facets/generic/facet-actions';
import {executeSearch} from '../../features/search/search-actions';
import {FacetValue} from '../../features/facets/facet-set/interfaces/response';
import {getSearchInitialState} from '../../features/search/search-state';
import {executeFacetBreadcrumb} from '../../features/facets/facet-set/facet-set-controller-actions';
import {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response';
import {executeDateFacetBreadcrumb} from '../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {executeNumericFacetBreadcrumb} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions';
import {CategoryFacetValue} from '../../features/facets/category-facet-set/interfaces/response';
import {executeDeselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-controller-actions';

describe('headless breadcrumb manager', () => {
  const facetId = 'abc123';
  let engine: MockEngine<SearchAppState>;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  function initController(mockState: SearchAppState = createMockState()) {
    state = mockState;
    engine = buildMockSearchAppEngine({state});
    breadcrumbManager = buildBreadcrumbManager(engine);
  }

  beforeEach(() => {
    initController();
  });

  describe('facet breadcrumbs', () => {
    let mockValue: FacetValue;
    let facetBreadcrumbs: FacetBreadcrumb[];

    beforeEach(() => {
      mockValue = buildMockFacetValue({state: 'selected'});

      initController(
        createMockState({
          search: {
            ...getSearchInitialState(),
            response: {
              ...getSearchInitialState().response,
              facets: [buildMockFacetResponse({facetId, values: [mockValue]})],
            },
          },
          facetSet: {
            [facetId]: buildMockFacetRequest({facetId}),
          },
        })
      );

      facetBreadcrumbs = breadcrumbManager.state.facetBreadcrumbs;
    });

    it('#state gets facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockValue);
    });

    it('dispatches an executeFacetBreadcrumb action on deselection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(
        engine.findAsyncAction(executeFacetBreadcrumb.pending)
      ).toBeTruthy();
    });
  });

  describe('date facet breadcrumbs', () => {
    let mockValue: DateFacetValue;
    let facetBreadcrumbs: DateFacetBreadcrumb[];

    beforeEach(() => {
      mockValue = buildMockDateFacetValue({state: 'selected'});

      initController(
        createMockState({
          search: {
            ...getSearchInitialState(),
            response: {
              ...getSearchInitialState().response,
              facets: [
                buildMockDateFacetResponse({facetId, values: [mockValue]}),
              ],
            },
          },
          dateFacetSet: {
            [facetId]: buildMockDateFacetRequest({facetId}),
          },
        })
      );

      facetBreadcrumbs = breadcrumbManager.state.dateFacetBreadcrumbs;
    });

    it('#state gets date facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockValue);
    });

    it('dispatches an executeDateFacetBreadcrumb action on deselection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(
        engine.findAsyncAction(executeDateFacetBreadcrumb.pending)
      ).toBeTruthy();
    });
  });

  describe('numeric facet breadcrumbs', () => {
    let mockValue: NumericFacetValue;
    let facetBreadcrumbs: NumericFacetBreadcrumb[];

    beforeEach(() => {
      mockValue = buildMockNumericFacetValue({state: 'selected'});

      initController(
        createMockState({
          search: {
            ...getSearchInitialState(),
            response: {
              ...getSearchInitialState().response,
              facets: [
                buildMockNumericFacetResponse({facetId, values: [mockValue]}),
              ],
            },
          },
          numericFacetSet: {
            [facetId]: buildMockNumericFacetRequest({facetId}),
          },
        })
      );

      facetBreadcrumbs = breadcrumbManager.state.numericFacetBreadcrumbs;
    });

    it('#state gets numeric facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockValue);
    });

    it('dispatches an executeNumericFacetBreadcrumb action on deselection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(
        engine.findAsyncAction(executeNumericFacetBreadcrumb.pending)
      ).toBeTruthy();
    });
  });

  describe('category facet breadcrumbs', () => {
    let mockValue: CategoryFacetValue;
    let facetBreadcrumbs: CategoryFacetBreadcrumb[];
    const otherFacetId = 'def456';

    beforeEach(() => {
      mockValue = buildMockCategoryFacetValue({state: 'selected'});

      initController(
        createMockState({
          search: {
            ...getSearchInitialState(),
            response: {
              ...getSearchInitialState().response,
              facets: [
                buildMockCategoryFacetResponse({facetId, values: [mockValue]}),
                buildMockCategoryFacetResponse({
                  facetId: otherFacetId,
                  values: [mockValue],
                }),
              ],
            },
          },
          categoryFacetSet: {
            [facetId]: buildMockCategoryFacetRequest({facetId}),
            [otherFacetId]: buildMockCategoryFacetRequest({
              facetId: otherFacetId,
            }),
          },
        })
      );

      facetBreadcrumbs = breadcrumbManager.state.categoryFacetBreadcrumbs;
    });

    it('#state gets category facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].path).toEqual([mockValue]);
      expect(facetBreadcrumbs[1].path).toEqual([mockValue]);
    });

    it('dispatches an executeDeselectAllCategoryFacetValues action on deselection', () => {
      facetBreadcrumbs[0].deselect();
      expect(
        engine.findAsyncAction(executeDeselectAllCategoryFacetValues.pending)
      ).toBeTruthy();
    });
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
    state.search.response.facets = [];
    expect(breadcrumbManager.hasBreadcrumbs()).toBe(false);
  });

  it('when calling deselectAll it dispatches the deselectAllFacets action', () => {
    breadcrumbManager.deselectAll();
    expect(engine.actions).toContainEqual(deselectAllFacets());
  });

  it('when calling deselectAll it dispatches the executeSearch action', () => {
    breadcrumbManager.deselectAll();
    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  });
});
