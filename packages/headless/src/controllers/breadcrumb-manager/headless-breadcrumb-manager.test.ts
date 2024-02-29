import {configuration} from '../../app/common-reducers';
import {deselectAllBreadcrumbs} from '../../features/breadcrumb/breadcrumb-actions';
import {toggleSelectAutomaticFacetValue} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetSetReducer as categoryFacetSet} from '../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetValue} from '../../features/facets/category-facet-set/interfaces/response';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions';
import {facetSetReducer as facetSet} from '../../features/facets/facet-set/facet-set-slice';
import {FacetValue} from '../../features/facets/facet-set/interfaces/response';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response';
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {executeSearch} from '../../features/search/search-actions';
import {searchReducer as search} from '../../features/search/search-slice';
import {getSearchInitialState} from '../../features/search/search-state';
import {
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockAutomaticFacetResponse} from '../../test/mock-automatic-facet-response';
import {buildMockAutomaticFacetSlice} from '../../test/mock-automatic-facet-slice';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetResponse} from '../../test/mock-category-facet-response';
import {buildMockCategoryFacetValue} from '../../test/mock-category-facet-value';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetResponse} from '../../test/mock-date-facet-response';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../test/mock-facet-value';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockNumericFacetResponse} from '../../test/mock-numeric-facet-response';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../test/mock-numeric-facet-value';
import {createMockState} from '../../test/mock-state';
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

jest.mock('../../features/breadcrumb/breadcrumb-actions');
jest.mock(
  '../../features/facets/automatic-facet-set/automatic-facet-set-actions'
);
jest.mock(
  '../../features/facets/category-facet-set/category-facet-set-actions'
);
jest.mock('../../features/facets/facet-set/facet-set-actions');
jest.mock(
  '../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
jest.mock(
  '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
jest.mock('../../features/search/search-actions');
jest.mock('../../features/static-filter-set/static-filter-set-actions');

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

  it('hasBreadcrumbs returns false when no facet value is selected or excluded', () => {
    state.search.response.facets = [];
    expect(breadcrumbManager.state.hasBreadcrumbs).toBe(false);
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(deselectAllBreadcrumbs).toHaveBeenCalled();
    });

    it('dispatches #executeSearch', () => {
      breadcrumbManager.deselectAll();
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
