import {configuration} from '../../app/common-reducers';
import {deselectAllBreadcrumbs} from '../../features/breadcrumb/breadcrumb-actions';
import {toggleSelectAutomaticFacetValue} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetSetReducer as categoryFacetSet} from '../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetValue} from '../../features/facets/category-facet-set/interfaces/response';
import {
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions';
import {facetSetReducer as facetSet} from '../../features/facets/facet-set/facet-set-slice';
import {FacetValue} from '../../features/facets/facet-set/interfaces/response';
import {toggleSelectDateFacetValue} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response';
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {toggleSelectNumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {executeSearch} from '../../features/search/search-actions';
import {searchReducer as search} from '../../features/search/search-slice';
import {getSearchInitialState} from '../../features/search/search-state';
import {toggleSelectStaticFilterValue} from '../../features/static-filter-set/static-filter-set-actions';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../test';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetResponse} from '../../test/mock-category-facet-response';
import {buildMockCategoryFacetValue} from '../../test/mock-category-facet-value';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetResponse} from '../../test/mock-date-facet-response';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../test/mock-facet-value';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockNumericFacetResponse} from '../../test/mock-numeric-facet-response';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../test/mock-numeric-facet-value';
import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value';
import {
  AutomaticFacetBreadcrumb,
  BreadcrumbManager,
  CategoryFacetBreadcrumb,
  DateFacetBreadcrumb,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager';

describe('headless breadcrumb manager', () => {
  const facetId = 'abc123';
  let engine: MockSearchEngine;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  function initController() {
    engine = buildMockSearchAppEngine();
    engine.state = state;
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
    let mockSelectedValue: FacetValue;
    let mockExcludedValue: FacetValue;
    let facetBreadcrumbs: FacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockFacetValue({
        state: 'selected',
      });
      mockExcludedValue = buildMockFacetValue({
        state: 'excluded',
      });

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockFacetResponse({
                facetId,
                values: [mockSelectedValue, mockExcludedValue],
              }),
            ],
          },
        },
        facetSet: {
          [facetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({facetId}),
          }),
        },
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.facetBreadcrumbs;
    });

    it('#state gets facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockSelectedValue);
      expect(facetBreadcrumbs[0].values[1].value).toBe(mockExcludedValue);
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
          selection: mockSelectedValue,
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
          selection: mockSelectedValue,
        })
      );
    });
  });

  describe('date facet breadcrumbs', () => {
    let mockSelectedValue: DateFacetValue;
    let facetBreadcrumbs: DateFacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockDateFacetValue({state: 'selected'});

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockDateFacetResponse({
                facetId,
                values: [mockSelectedValue],
              }),
            ],
          },
        },
        dateFacetSet: {
          [facetId]: buildMockDateFacetSlice({
            request: buildMockDateFacetRequest({facetId}),
          }),
        },
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.dateFacetBreadcrumbs;
    });

    it('#state gets date facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockSelectedValue);
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
          selection: mockSelectedValue,
        })
      );
    });

    it('dispatches a toggleSelectDateFacetValue action when #deselectBreadcrumb is called', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(engine.actions).toContainEqual(
        toggleSelectDateFacetValue({
          facetId,
          selection: mockSelectedValue,
        })
      );
    });
  });

  describe('numeric facet breadcrumbs', () => {
    let mockSelectedValue: NumericFacetValue;
    let facetBreadcrumbs: NumericFacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockNumericFacetValue({state: 'selected'});

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockNumericFacetResponse({
                facetId,
                values: [mockSelectedValue],
              }),
            ],
          },
        },
        numericFacetSet: {
          [facetId]: buildMockNumericFacetSlice({
            request: buildMockNumericFacetRequest({facetId}),
          }),
        },
      });
      initController();

      facetBreadcrumbs = breadcrumbManager.state.numericFacetBreadcrumbs;
    });

    it('#state gets numeric facet breadcrumbs correctly', () => {
      expect(facetBreadcrumbs[0].values[0].value).toBe(mockSelectedValue);
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
          selection: mockSelectedValue,
        })
      );
    });

    it('dispatches a toggleSelectNumericFacetValue action when #deselectBreadcrumb is called', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(engine.actions).toContainEqual(
        toggleSelectNumericFacetValue({
          facetId,
          selection: mockSelectedValue,
        })
      );
    });
  });

  describe('category facet breadcrumbs', () => {
    let mockSelectedValue: CategoryFacetValue;
    let facetBreadcrumbs: CategoryFacetBreadcrumb[];
    const otherFacetId = 'def456';

    beforeEach(() => {
      mockSelectedValue = buildMockCategoryFacetValue({state: 'selected'});

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockCategoryFacetResponse({
                facetId,
                values: [mockSelectedValue],
              }),
              buildMockCategoryFacetResponse({
                facetId: otherFacetId,
                values: [mockSelectedValue],
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
      expect(facetBreadcrumbs[0].path).toEqual([mockSelectedValue]);
      expect(facetBreadcrumbs[1].path).toEqual([mockSelectedValue]);
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

  describe('static filter breadcrumbs', () => {
    const id = 'a';
    const idle = buildMockStaticFilterValue({caption: 'b', state: 'idle'});
    const selected = buildMockStaticFilterValue({
      caption: 'c',
      state: 'selected',
    });

    beforeEach(() => {
      state.staticFilterSet = {
        [id]: buildMockStaticFilterSlice({id, values: [idle, selected]}),
      };
    });

    it('#state gets static filter breadcrumbs correctly', () => {
      const {staticFilterBreadcrumbs} = breadcrumbManager.state;
      const [firstFilter] = staticFilterBreadcrumbs;

      expect(staticFilterBreadcrumbs.length).toBe(1);
      expect(firstFilter.id).toBe(id);

      const {values} = firstFilter;
      expect(values.length).toBe(1);
      expect(values[0].value.caption).toBe(selected.caption);
    });

    it('#state.hasBreadcrumbs returns true', () => {
      expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
    });

    describe('#deselectBreadcrumb with a static filter breadcrumb value dispatches the correct actions', () => {
      beforeEach(() => {
        const {staticFilterBreadcrumbs} = breadcrumbManager.state;
        const [firstBreadcrumb] = staticFilterBreadcrumbs[0].values;

        breadcrumbManager.deselectBreadcrumb(firstBreadcrumb);
      });

      it('dispatches #toggleSelectStaticFilterValue', () => {
        const toggleSelect = toggleSelectStaticFilterValue({
          id,
          value: selected,
        });
        expect(engine.actions).toContainEqual(toggleSelect);
      });

      it('dispatches #executeSearch', () => {
        const action = engine.findAsyncAction(executeSearch.pending);
        expect(action).toBeTruthy();
      });
    });
  });

  describe('automatic facet breadcrumbs', () => {
    let mockSelectedValue: FacetValue;
    let automaticFacetBreadcrumbs: AutomaticFacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockFacetValue({state: 'selected'});

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockFacetResponse({
                facetId,
                values: [mockSelectedValue],
              }),
            ],
          },
        },
        facetSet: {
          [facetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({facetId}),
          }),
        },
      });
      initController();

      automaticFacetBreadcrumbs =
        breadcrumbManager.state.automaticFacetBreadcrumbs;
    });

    it('#state get automatic facet breadcrumbs correctly', () => {
      expect(automaticFacetBreadcrumbs[0].values[0].value).toBe(
        mockSelectedValue
      );
    });

    it('dispatches an executeSearch action on selection', () => {
      automaticFacetBreadcrumbs[0].values[0].deselect();
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('dispatches an toggleSelectAutomaticFacetValue action on selection', () => {
      automaticFacetBreadcrumbs[0].values[0].deselect();
      expect(engine.actions).toContainEqual(
        toggleSelectAutomaticFacetValue({
          field: facetId,
          selection: mockSelectedValue,
        })
      );
    });
  });

  it('hasBreadcrumbs returns true when a facet value is selected', () => {
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice({
      request: buildMockNumericFacetRequest({facetId}),
    });
    const mockSelectedValue = buildMockNumericFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [mockSelectedValue]}),
    ];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
  });

  it('hasBreadcrumbs returns false when no facet value is selected', () => {
    state.search.response.facets = [];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(false);
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllBreadcrumbs());
    });

    it('dispatches #executeSearch', () => {
      breadcrumbManager.deselectAll();
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });
  });
});
