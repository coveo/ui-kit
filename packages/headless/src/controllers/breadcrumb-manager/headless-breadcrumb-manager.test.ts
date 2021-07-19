import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
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
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {CategoryFacetValue} from '../../features/facets/category-facet-set/interfaces/response';
import {
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions';
import {toggleSelectDateFacetValue} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {toggleSelectNumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {
  configuration,
  search,
  facetSet,
  numericFacetSet,
  dateFacetSet,
  categoryFacetSet,
} from '../../app/reducers';
import {DateFacetValue} from '../facets/range-facet/date-facet/headless-date-facet';

describe('headless breadcrumb manager', () => {
  const facetId = 'abc123';
  let engine: MockSearchEngine;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  function initController() {
    engine = buildMockSearchAppEngine({state});
    breadcrumbManager = buildBreadcrumbManager(engine);
  }

  beforeEach(() => {
    state = createMockState();
    initController();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      search,
      facetSet,
      numericFacetSet,
      dateFacetSet,
      categoryFacetSet,
    });
  });

  describe('facet breadcrumbs', () => {
    let mockValue: FacetValue;
    let facetBreadcrumbs: FacetBreadcrumb[];

    beforeEach(() => {
      mockValue = buildMockFacetValue({
        state: 'selected',
      });

      state = createMockState({
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
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.facetBreadcrumbs;
    });

    it('#state gets facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockValue);
    });

    it('dispatches an executeSearch action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('dispatches an toggleSelectFacetValue action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({
          facetId,
          selection: mockValue,
        })
      );
    });

    it('dispatches an updateFreezeCurrentValues action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.actions).toContainEqual(
        updateFreezeCurrentValues({
          facetId,
          freezeCurrentValues: false,
        })
      );
    });

    it('dispatches a toggleSelectFacetValue action when #deselectBreadcrumb is called', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({
          facetId,
          selection: mockValue,
        })
      );
    });
  });

  describe('date facet breadcrumbs', () => {
    let mockValue: DateFacetValue;
    let facetBreadcrumbs: DateFacetBreadcrumb[];

    beforeEach(() => {
      mockValue = buildMockDateFacetValue({state: 'selected'});

      state = createMockState({
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
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.dateFacetBreadcrumbs;
    });

    it('#state gets date facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockValue);
    });

    it('dispatches an executeSearch action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('dispatches a toggleSelectDateFacetValue action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.actions).toContainEqual(
        toggleSelectDateFacetValue({
          facetId,
          selection: mockValue,
        })
      );
    });

    it('dispatches a toggleSelectDateFacetValue action when #deselectBreadcrumb is called', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(engine.actions).toContainEqual(
        toggleSelectDateFacetValue({
          facetId,
          selection: mockValue,
        })
      );
    });
  });

  describe('numeric facet breadcrumbs', () => {
    let mockValue: NumericFacetValue;
    let facetBreadcrumbs: NumericFacetBreadcrumb[];

    beforeEach(() => {
      mockValue = buildMockNumericFacetValue({state: 'selected'});

      state = createMockState({
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
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.numericFacetBreadcrumbs;
    });

    it('#state gets numeric facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockValue);
    });

    it('dispatches an executeSearch action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('dispatches a toggleSelectNumericFacetValue action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(engine.actions).toContainEqual(
        toggleSelectNumericFacetValue({
          facetId,
          selection: mockValue,
        })
      );
    });

    it('dispatches a toggleSelectNumericFacetValue action when #deselectBreadcrumb is called', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(engine.actions).toContainEqual(
        toggleSelectNumericFacetValue({
          facetId,
          selection: mockValue,
        })
      );
    });
  });

  describe('category facet breadcrumbs', () => {
    let mockValue: CategoryFacetValue;
    let facetBreadcrumbs: CategoryFacetBreadcrumb[];
    const otherFacetId = 'def456';

    beforeEach(() => {
      mockValue = buildMockCategoryFacetValue({state: 'selected'});

      state = createMockState({
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
          [facetId]: {
            initialNumberOfValues: 10,
            request: buildMockCategoryFacetRequest({facetId}),
          },
          [otherFacetId]: {
            initialNumberOfValues: 10,
            request: buildMockCategoryFacetRequest({
              facetId: otherFacetId,
            }),
          },
        },
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.categoryFacetBreadcrumbs;
    });

    it('#state gets category facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].path).toEqual([mockValue]);
      expect(facetBreadcrumbs[1].path).toEqual([mockValue]);
    });

    it('dispatches an executeSearch action on selection', () => {
      facetBreadcrumbs[0].deselect();
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('dispatches a deselectAllCategoryFacetValues action on selection', () => {
      facetBreadcrumbs[0].deselect();
      expect(engine.actions).toContainEqual(
        deselectAllCategoryFacetValues(facetId)
      );
    });

    it('dispatches a deselectAllCategoryFacetValues action when #deselectBreadcrumb is called', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0]);
      expect(engine.actions).toContainEqual(
        deselectAllCategoryFacetValues(facetId)
      );
    });
  });

  it('hasBreadcrumbs returns true when a facet value is selected', () => {
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest({facetId});
    const mockValue = buildMockNumericFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [mockValue]}),
    ];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
  });

  it('hasBreadcrumbs returns false when no facet value is selected', () => {
    state.search.response.facets = [];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(false);
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
