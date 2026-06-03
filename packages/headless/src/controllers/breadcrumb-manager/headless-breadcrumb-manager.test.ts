import {configuration} from '../../app/common-reducers.js';
import {deselectAllBreadcrumbs} from '../../features/breadcrumb/breadcrumb-actions.js';
import {toggleSelectAutomaticFacetValue} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions.js';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions.js';
import {categoryFacetSetReducer as categoryFacetSet} from '../../features/facets/category-facet-set/category-facet-set-slice.js';
import type {CategoryFacetValue} from '../../features/facets/category-facet-set/interfaces/response.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions.js';
import {facetSetReducer as facetSet} from '../../features/facets/facet-set/facet-set-slice.js';
import type {FacetValue} from '../../features/facets/facet-set/interfaces/response.js';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {dateFacetSetReducer as dateFacetSet} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import type {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {numericFacetSetReducer as numericFacetSet} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {getSearchInitialState} from '../../features/search/search-state.js';
import {
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {buildMockAutomaticFacetResponse} from '../../test/mock-automatic-facet-response.js';
import {buildMockAutomaticFacetSlice} from '../../test/mock-automatic-facet-slice.js';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetResponse} from '../../test/mock-category-facet-response.js';
import {buildMockCategoryFacetValue} from '../../test/mock-category-facet-value.js';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request.js';
import {buildMockDateFacetResponse} from '../../test/mock-date-facet-response.js';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockFacetRequest} from '../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../test/mock-facet-response.js';
import {buildMockFacetSlice} from '../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../test/mock-facet-value.js';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetResponse} from '../../test/mock-numeric-facet-response.js';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../test/mock-state.js';
import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice.js';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value.js';
import {
  type AutomaticFacetBreadcrumb,
  type BreadcrumbManager,
  buildBreadcrumbManager,
  type CategoryFacetBreadcrumb,
  type DateFacetBreadcrumb,
  type FacetBreadcrumb,
  type NumericFacetBreadcrumb,
} from './headless-breadcrumb-manager.js';

vi.mock('../../features/breadcrumb/breadcrumb-actions');
vi.mock(
  '../../features/facets/automatic-facet-set/automatic-facet-set-actions'
);
vi.mock('../../features/facets/category-facet-set/category-facet-set-actions');
vi.mock('../../features/facets/facet-set/facet-set-actions');
vi.mock('../../features/facets/range-facets/date-facet-set/date-facet-actions');
vi.mock(
  '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
vi.mock('../../features/search/search-actions');
vi.mock('../../features/static-filter-set/static-filter-set-actions');
vi.mock('../../features/facets/generic/facet-generic-analytics-actions');

describe('headless breadcrumb manager', () => {
  const facetId = 'abc123';
  let engine: MockedSearchEngine;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  function initController() {
    engine = buildMockSearchEngine(createMockState());
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
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches an toggleSelectFacetValue action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(toggleSelectFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockSelectedValue,
      });
    });

    it('dispatches an updateFreezeCurrentValues action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(updateFreezeCurrentValues).toHaveBeenCalledWith({
        facetId,
        freezeCurrentValues: false,
      });
    });

    it('dispatches an executeSearch action on exclusion', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches a toggleExcludeFacetValue action on exclusion', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(toggleSelectFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockSelectedValue,
      });
    });

    it('dispatches an updateFreezeCurrentValues action on exclusion', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(updateFreezeCurrentValues).toHaveBeenCalledWith({
        facetId,
        freezeCurrentValues: false,
      });
    });

    it('dispatches a toggleSelectFacetValue action when #deselectBreadcrumb is called for a selected facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(toggleSelectFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockSelectedValue,
      });
    });

    it('dispatches a toggleExcludeFacetValue action when #deselectBreadcrumb is called for an excluded facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[1]);
      expect(toggleExcludeFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockExcludedValue,
      });
    });
  });

  describe('date facet breadcrumbs', () => {
    let mockSelectedValue: DateFacetValue;
    let mockExcludedValue: DateFacetValue;
    let facetBreadcrumbs: DateFacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockDateFacetValue({state: 'selected'});
      mockExcludedValue = buildMockDateFacetValue({state: 'excluded'});

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockDateFacetResponse({
                facetId,
                values: [mockSelectedValue, mockExcludedValue],
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
      expect(facetBreadcrumbs[0].values[1].value).toBe(mockExcludedValue);
    });

    it('dispatches an executeSearch action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches a toggleSelectDateFacetValue action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(toggleSelectDateFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockSelectedValue,
      });
    });

    it('dispatches a toggleSelectDateFacetValue action when #deselectBreadcrumb is called for a selected facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(toggleSelectDateFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockSelectedValue,
      });
    });

    it('dispatches a toggleExcludeDateFacetValue action when #deselectBreadcrumb is called for an excluded facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[1]);
      expect(toggleExcludeDateFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockExcludedValue,
      });
    });
  });

  describe('numeric facet breadcrumbs', () => {
    let mockSelectedValue: NumericFacetValue;
    let mockExcludedValue: NumericFacetValue;
    let facetBreadcrumbs: NumericFacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockNumericFacetValue({state: 'selected'});
      mockExcludedValue = buildMockNumericFacetValue({state: 'excluded'});

      state = createMockState({
        search: {
          ...getSearchInitialState(),
          response: {
            ...getSearchInitialState().response,
            facets: [
              buildMockNumericFacetResponse({
                facetId,
                values: [mockSelectedValue, mockExcludedValue],
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
      expect(facetBreadcrumbs[0].values[1].value).toBe(mockExcludedValue);
    });

    it('dispatches an executeSearch action on selection', () => {
      facetBreadcrumbs[0].values[0].deselect();
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches an executeSearch action on exclusion', () => {
      facetBreadcrumbs[0].values[1].deselect();
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches a toggleExcludeNumericFacetValue action on exclusion', () => {
      facetBreadcrumbs[0].values[1].deselect();
      expect(toggleExcludeNumericFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockExcludedValue,
      });
    });

    it('dispatches a toggleSelectNumericFacetValue action when #deselectBreadcrumb is called for a selected facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[0]);
      expect(toggleSelectNumericFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockSelectedValue,
      });
    });
    it('dispatches a toggleExcludeNumericFacetValue action when #deselectBreadcrumb is called for an excluded facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0].values[1]);
      expect(toggleExcludeNumericFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: mockExcludedValue,
      });
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
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches a deselectAllCategoryFacetValues action on selection', () => {
      facetBreadcrumbs[0].deselect();
      expect(deselectAllCategoryFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches a deselectAllCategoryFacetValues action when #deselectBreadcrumb is called for a selected facet value', () => {
      breadcrumbManager.deselectBreadcrumb(facetBreadcrumbs[0]);
      expect(deselectAllCategoryFacetValues).toHaveBeenCalledWith(facetId);
    });
  });

  describe('static filter breadcrumbs', () => {
    const id = 'a';
    const idle = buildMockStaticFilterValue({caption: 'b', state: 'idle'});
    const selected = buildMockStaticFilterValue({
      caption: 'c',
      state: 'selected',
    });
    const excluded = buildMockStaticFilterValue({
      caption: 'd',
      state: 'excluded',
    });

    beforeEach(() => {
      state.staticFilterSet = {
        [id]: buildMockStaticFilterSlice({
          id,
          values: [idle, selected, excluded],
        }),
      };
    });

    it('#state gets static filter breadcrumbs correctly', () => {
      const {staticFilterBreadcrumbs} = breadcrumbManager.state;
      const [firstFilter] = staticFilterBreadcrumbs;

      expect(staticFilterBreadcrumbs.length).toBe(1);
      expect(firstFilter.id).toBe(id);

      const {values} = firstFilter;
      expect(values.length).toBe(2);

      expect(values[0].value.caption).toBe(selected.caption);
      expect(values[1].value.caption).toBe(excluded.caption);
    });

    it('#state.hasBreadcrumbs returns true', () => {
      expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
    });

    describe('#deselectBreadcrumb with a static filter breadcrumb value dispatches the correct actions', () => {
      describe('#selected values', () => {
        beforeEach(() => {
          const {staticFilterBreadcrumbs} = breadcrumbManager.state;
          const [selectedBreadcrumb] = staticFilterBreadcrumbs[0].values;
          breadcrumbManager.deselectBreadcrumb(selectedBreadcrumb);
        });

        it('dispatches #toggleSelectStaticFilterValue', () => {
          expect(toggleSelectStaticFilterValue).toHaveBeenCalledWith({
            id,
            value: selected,
          });
        });

        it('dispatches #executeSearch', () => {
          expect(executeSearch).toHaveBeenCalled();
        });
      });

      describe('#excluded values', () => {
        beforeEach(() => {
          const {staticFilterBreadcrumbs} = breadcrumbManager.state;
          const [, excludedBreadcrumb] = staticFilterBreadcrumbs[0].values;
          breadcrumbManager.deselectBreadcrumb(excludedBreadcrumb);
        });

        it('dispatches #toggleExcludeStaticFilterValue', () => {
          expect(toggleExcludeStaticFilterValue).toHaveBeenCalledWith({
            id,
            value: excluded,
          });
        });

        it('dispatches #executeSearch', () => {
          expect(executeSearch).toHaveBeenCalled();
        });
      });
    });
  });

  describe('automatic facet breadcrumbs', () => {
    let mockSelectedValue: FacetValue;
    let automaticFacetBreadcrumbs: AutomaticFacetBreadcrumb[];

    beforeEach(() => {
      mockSelectedValue = buildMockFacetValue({state: 'selected'});

      state = createMockState({
        automaticFacetSet: {
          desiredCount: 1,
          numberOfValues: 8,
          set: {
            [facetId]: buildMockAutomaticFacetSlice({
              response: buildMockAutomaticFacetResponse({
                field: facetId,
                values: [mockSelectedValue],
              }),
            }),
          },
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
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches an toggleSelectAutomaticFacetValue action on selection', () => {
      automaticFacetBreadcrumbs[0].values[0].deselect();
      expect(toggleSelectAutomaticFacetValue).toHaveBeenCalledWith({
        field: facetId,
        selection: mockSelectedValue,
      });
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

  it('hasBreadcrumbs returns true when a facet value is excluded', () => {
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice({
      request: buildMockNumericFacetRequest({facetId}),
    });
    const mockSelectedValue = buildMockNumericFacetValue({state: 'excluded'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [mockSelectedValue]}),
    ];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
  });

  it('hasBreadcrumbs returns true when an automatic facet value is selected', () => {
    state.automaticFacetSet = {
      desiredCount: 1,
      numberOfValues: 8,
      set: {
        [facetId]: buildMockAutomaticFacetSlice({
          response: buildMockAutomaticFacetResponse({
            field: facetId,
            values: [buildMockFacetValue({state: 'selected'})],
          }),
        }),
      },
    };

    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
  });

  it('hasBreadcrumbs returns true when an automatic facet value is excluded', () => {
    state.automaticFacetSet = {
      desiredCount: 1,
      numberOfValues: 8,
      set: {
        [facetId]: buildMockAutomaticFacetSlice({
          response: buildMockAutomaticFacetResponse({
            field: facetId,
            values: [buildMockFacetValue({state: 'excluded'})],
          }),
        }),
      },
    };

    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(true);
  });

  it('hasBreadcrumbs returns false when no facet value is selected or excluded', () => {
    state.search.response.facets = [];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(false);
  });

  it('hasBreadcrumbs returns false when an automatic facet has no value', () => {
    state.automaticFacetSet = {
      desiredCount: 1,
      numberOfValues: 8,
      set: {
        [facetId]: buildMockAutomaticFacetSlice({
          response: buildMockAutomaticFacetResponse({
            field: facetId,
            values: [],
          }),
        }),
      },
    };

    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(false);
  });

  it('hasBreadcrumbs returns false when an automatic facet only has idle values', () => {
    state.automaticFacetSet = {
      desiredCount: 1,
      numberOfValues: 8,
      set: {
        [facetId]: buildMockAutomaticFacetSlice({
          response: buildMockAutomaticFacetResponse({
            field: facetId,
            values: [buildMockFacetValue({state: 'idle'})],
          }),
        }),
      },
    };

    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(false);
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(deselectAllBreadcrumbs).toHaveBeenCalled();
    });

    it('dispatches #executeSearch', () => {
      vi.clearAllMocks();
      breadcrumbManager.deselectAll();
      expect(executeSearch).toHaveBeenCalled();
      expect(executeSearch).toHaveBeenCalledTimes(1);
      expect(executeSearch).toHaveBeenCalledWith({
        legacy: logClearBreadcrumbs(),
        next: {
          actionCause: 'breadcrumbResetAll',
        },
      });
    });
  });
});
