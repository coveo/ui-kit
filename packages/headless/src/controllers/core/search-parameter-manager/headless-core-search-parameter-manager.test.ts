import {restoreSearchParameters} from '../../../features/search-parameters/search-parameter-actions.js';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors.js';
import {buildMockAutomaticFacetResponse} from '../../../test/mock-automatic-facet-response.js';
import {buildMockAutomaticFacetSlice} from '../../../test/mock-automatic-facet-slice.js';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice.js';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request.js';
import {buildMockDateFacetRequest} from '../../../test/mock-date-facet-request.js';
import {buildMockDateFacetSlice} from '../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../test/mock-date-facet-value.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../../test/mock-facet-value.js';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request.js';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetSlice} from '../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value.js';
import {buildMockSearchParameters} from '../../../test/mock-search-parameters.js';
import {createMockState} from '../../../test/mock-state.js';
import {buildMockStaticFilterSlice} from '../../../test/mock-static-filter-slice.js';
import {buildMockStaticFilterValue} from '../../../test/mock-static-filter-value.js';
import {buildMockTabSlice} from '../../../test/mock-tab-state.js';
import {
  buildCoreSearchParameterManager,
  type SearchParameterManager,
  type SearchParameterManagerProps,
} from './headless-core-search-parameter-manager.js';

vi.mock('../../../features/search-parameters/search-parameter-actions');

describe('search parameter manager', () => {
  let engine: MockedSearchEngine;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildCoreSearchParameterManager(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    props = {
      initialState: {
        parameters: {},
      },
    };

    initSearchParameterManager();
    vi.clearAllMocks();
  });

  it('exposes a #subscribe method', () => {
    expect(manager.subscribe).toBeTruthy();
  });

  it('exposes a #parameters property under state', () => {
    expect(manager.state.parameters).toBeTruthy();
  });

  it('should dispatch #restoreSearchParameters with the the active tab as the tab parameter when the tab does not exist in the tabSet and there is an active tab', () => {
    const id1 = 'a';
    const id2 = 'b';
    const tab1 = buildMockTabSlice({id: id1, isActive: false});
    const tab2 = buildMockTabSlice({id: id2, isActive: true});
    engine.state.tabSet = {[id1]: tab1, [id2]: tab2};

    props.initialState.parameters = {tab: 'c'};
    initSearchParameterManager();

    expect(restoreSearchParameters).toHaveBeenCalledWith({
      tab: id2,
    });
  });

  it('should dispatch #restoreSearchParameters with an empty string as the tab parameter when there is no active tab', () => {
    const id1 = 'a';
    const id2 = 'b';
    const tab1 = buildMockTabSlice({id: id1, isActive: false});
    const tab2 = buildMockTabSlice({id: id2, isActive: false});
    engine.state.tabSet = {[id1]: tab1, [id2]: tab2};

    props.initialState.parameters = {tab: 'c'};
    initSearchParameterManager();

    expect(restoreSearchParameters).toHaveBeenCalledWith({
      tab: '',
    });
  });

  it('should dispatch #restoreSearchParameters with the original tab parameter when it exists in the tabSet', () => {
    const id1 = 'a';
    const id2 = 'b';
    const tab1 = buildMockTabSlice({id: id1, isActive: false});
    const tab2 = buildMockTabSlice({id: id2, isActive: true});
    engine.state.tabSet = {[id1]: tab1, [id2]: tab2};

    props.initialState.parameters = {tab: id2};
    initSearchParameterManager();

    expect(restoreSearchParameters).toHaveBeenCalledWith({
      tab: id2,
    });
  });

  it('should dispatch #restoreSearchParameters with the original parameters when there is no tab parameter and no tabSet', () => {
    props.initialState.parameters = {q: 'a'};
    engine.state.tabSet = {};
    initSearchParameterManager();

    expect(restoreSearchParameters).toHaveBeenCalledWith({
      q: 'a',
    });
  });

  it('throws an error when #parameters is not an object', () => {
    props.initialState.parameters = true as never;
    expect(() => initSearchParameterManager()).toThrow(
      'Check the initialState of buildSearchParameterManager'
    );
  });

  describe('#state.parameters.q', () => {
    it('is included when the parameter does not equal the default value', () => {
      engine.state.query!.q = 'a';
      expect(manager.state.parameters.q).toBe('a');
    });

    it('is not included when the parameter is equal to the default value', () => {
      expect(manager.state.parameters).not.toContain('q');
    });
  });
  describe('#state.parameters.tab', () => {
    it('is included when there are at least two tabs, and the active one is not the first one', () => {
      const id1 = 'a';
      const id2 = 'b';
      const tab1 = buildMockTabSlice({id: id1, isActive: false});
      const tab2 = buildMockTabSlice({id: id2, isActive: true});
      engine.state.tabSet = {[id1]: tab1, [id2]: tab2};
      expect(manager.state.parameters.tab).toBe(id2);
    });

    it('is not included when there is no active tab', () => {
      const id1 = 'a';
      const id2 = 'b';
      const tab1 = buildMockTabSlice({id: id1, isActive: false});
      const tab2 = buildMockTabSlice({id: id2, isActive: false});
      engine.state.tabSet = {[id1]: tab1, [id2]: tab2};
      expect(manager.state.parameters.tab).toBe(undefined);
    });

    it('is not included when the active tab is the first one', () => {
      const id1 = 'a';
      const id2 = 'b';
      const tab1 = buildMockTabSlice({id: id1, isActive: true});
      const tab2 = buildMockTabSlice({id: id2, isActive: false});
      engine.state.tabSet = {[id1]: tab1, [id2]: tab2};
      expect(manager.state.parameters.tab).toBe(undefined);
    });
  });

  describe('#state.parameters.f', () => {
    it('only includes selected values when a facet has some', () => {
      const selected = buildMockFacetValueRequest({
        value: 'a',
        state: 'selected',
      });
      const idle = buildMockFacetValueRequest({value: 'b', state: 'idle'});

      const currentValues = [selected, idle];
      engine.state.facetSet = {
        author: buildMockFacetSlice({
          request: buildMockFacetRequest({currentValues}),
        }),
      };

      expect(manager.state.parameters.f).toEqual({author: ['a']});
    });

    it('is not included when there are no facets with selected values', () => {
      engine.state.facetSet = {author: buildMockFacetSlice()};
      expect(manager.state.parameters).not.toContain('f');
    });
  });

  describe('#state.parameters.fExcluded', () => {
    it('only includes excluded values when a facet has some', () => {
      const excluded = buildMockFacetValueRequest({
        value: 'a',
        state: 'excluded',
      });
      const idle = buildMockFacetValueRequest({value: 'b', state: 'idle'});
      const selected = buildMockFacetValueRequest({
        value: 'c',
        state: 'selected',
      });

      const currentValues = [excluded, idle, selected];
      engine.state.facetSet = {
        author: buildMockFacetSlice({
          request: buildMockFacetRequest({currentValues}),
        }),
      };

      expect(manager.state.parameters.fExcluded).toEqual({author: ['a']});
    });

    it('is not included when there are no facets with selected values', () => {
      engine.state.facetSet = {author: buildMockFacetSlice()};
      expect(manager.state.parameters).not.toContain('fExcluded');
    });
  });

  describe('#state.parameters.cf', () => {
    it('only includes selected values when a category facet has some', () => {
      const selected = buildMockCategoryFacetValueRequest({
        value: 'a',
        state: 'selected',
      });

      const idle = buildMockCategoryFacetValueRequest({
        value: 'b',
        state: 'idle',
      });

      const request = buildMockCategoryFacetRequest({
        currentValues: [selected, idle],
      });

      engine.state.categoryFacetSet = {
        author: buildMockCategoryFacetSlice({request}),
      };

      expect(manager.state.parameters.cf).toEqual({author: ['a']});
    });

    it('includes the full path when a category facet has a nested selection', () => {
      const child = buildMockCategoryFacetValueRequest({
        value: 'b',
        state: 'selected',
      });

      const parent = buildMockCategoryFacetValueRequest({
        value: 'a',
        children: [child],
      });

      const request = buildMockCategoryFacetRequest({currentValues: [parent]});
      engine.state.categoryFacetSet = {
        author: buildMockCategoryFacetSlice({request}),
      };

      expect(manager.state.parameters.cf).toEqual({author: ['a', 'b']});
    });

    it('is not included when there are no category facets with selected values', () => {
      engine.state.categoryFacetSet = {author: buildMockCategoryFacetSlice()};
      expect(manager.state.parameters).not.toContain('cf');
    });
  });

  describe('#state.parameters.nf', () => {
    it('only includes selected values when a numeric facet has some', () => {
      const selected = buildMockNumericFacetValue({
        start: 0,
        end: 10,
        state: 'selected',
      });
      const idle = buildMockNumericFacetValue({
        start: 10,
        end: 20,
        state: 'idle',
      });

      const currentValues = [selected, idle];
      engine.state.numericFacetSet = {
        size: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({currentValues}),
        }),
      };

      expect(manager.state.parameters.nf).toEqual({size: [selected]});
    });

    it('is not included when there are no numeric facets with selected values', () => {
      engine.state.numericFacetSet = {author: buildMockNumericFacetSlice()};
      expect(manager.state.parameters).not.toContain('nf');
    });
  });

  describe('#state.parameters.df', () => {
    it('only includes selected values when a date facet has some', () => {
      const selected = buildMockDateFacetValue({
        start: '2020/10/01',
        end: '2020/11/01',
        state: 'selected',
      });
      const idle = buildMockDateFacetValue({
        start: '2020/11/01',
        end: '2020/12/01',
        state: 'idle',
      });

      const currentValues = [selected, idle];
      engine.state.dateFacetSet = {
        created: buildMockDateFacetSlice({
          request: buildMockDateFacetRequest({currentValues}),
        }),
      };

      expect(manager.state.parameters.df).toEqual({created: [selected]});
    });

    it('is not included when there are no date facets with selected values', () => {
      engine.state.dateFacetSet = {created: buildMockDateFacetSlice()};
      expect(manager.state.parameters).not.toContain('df');
    });
  });

  describe('#state.parameters.af', () => {
    it('only includes selected values when a facet has some', () => {
      const selected = buildMockFacetValue({
        value: 'a',
        state: 'selected',
      });
      const idle = buildMockFacetValue({value: 'b', state: 'idle'});

      const currentValues = [selected, idle];
      const slice = buildMockAutomaticFacetSlice({
        response: buildMockAutomaticFacetResponse({values: currentValues}),
      });
      engine.state.automaticFacetSet!.set = {author: slice};
      expect(manager.state.parameters.af).toEqual({author: ['a']});
    });

    it('is not included when there are no facets with selected values', () => {
      engine.state.automaticFacetSet!.set = {
        author: buildMockAutomaticFacetSlice(),
      };
      expect(manager.state.parameters).not.toContain('af');
    });
  });

  describe('#state.parameters.sortCriteria', () => {
    it('is included when the parameter does not equal the default value, ', () => {
      engine.state.sortCriteria = 'qre';
      expect(manager.state.parameters.sortCriteria).toBe('qre');
    });

    it('is not included when the parameter is equal to the default value', () => {
      expect(manager.state.parameters).not.toContain('sortCriteria');
    });

    it('is not included when the parameter is undefined', () => {
      engine.state.sortCriteria = undefined as never;
      expect(manager.state.parameters).not.toContain('sortCriteria');
    });
  });

  it('is possible to access every relevant search parameter using #state.parameters given a certain initial state', () => {
    const facetValues = [
      buildMockFacetValueRequest({state: 'selected'}),
      buildMockFacetValueRequest({state: 'excluded'}),
    ];
    engine.state.facetSet = {
      author: buildMockFacetSlice({
        request: buildMockFacetRequest({currentValues: facetValues}),
      }),
    };

    const request = buildMockCategoryFacetRequest({
      currentValues: [buildMockCategoryFacetValueRequest({state: 'selected'})],
    });
    engine.state.categoryFacetSet = {
      author: buildMockCategoryFacetSlice({request}),
    };

    const numericRanges = [buildMockNumericFacetValue({state: 'selected'})];
    engine.state.numericFacetSet = {
      size: buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: numericRanges}),
      }),
    };

    const dateRanges = [buildMockDateFacetValue({state: 'selected'})];
    engine.state.dateFacetSet = {
      created: buildMockDateFacetSlice({
        request: buildMockDateFacetRequest({currentValues: dateRanges}),
      }),
    };

    const staticFilterValues = [
      buildMockStaticFilterValue({state: 'selected'}),
    ];
    engine.state.staticFilterSet = {
      a: buildMockStaticFilterSlice({id: 'a', values: staticFilterValues}),
    };

    const tab = buildMockTabSlice({id: 'a', isActive: false});
    const tab2 = buildMockTabSlice({id: 'b', isActive: true});
    engine.state.tabSet = {a: tab, b: tab2};

    const automaticFacetValues = [buildMockFacetValue({state: 'selected'})];
    const slice = buildMockAutomaticFacetSlice({
      response: buildMockAutomaticFacetResponse({values: automaticFacetValues}),
    });
    engine.state.automaticFacetSet!.set = {a: slice};

    engine.state.query!.q = 'a';
    engine.state.sortCriteria = 'qre';

    const stateParams = manager.state.parameters;
    const allKeys = Object.keys(buildMockSearchParameters());
    const unavailableKeys = allKeys.filter((key) => !(key in stateParams));

    expect(unavailableKeys).toEqual([
      'enableQuerySyntax',
      'aq',
      'cq',
      'firstResult',
      'numberOfResults',
      'debug',
      'sf',
    ]);
  });

  describe('#synchronize', () => {
    it('it dispatches #restoreSearchParameters with non-specified parameters set to their initial values given partial search parameters', () => {
      const params = {q: 'a', cq: 'b'};
      manager.synchronize(params);

      const initialParameters = initialSearchParameterSelector(engine.state);

      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        ...params,
      });
    });

    it('should dispatch #restoreSearchParameters with non-specified parameters set to their initial values given partial search parameters excluding the tab', () => {
      const params = {q: 'a'};
      manager.synchronize(params);

      const initialParameters = initialSearchParameterSelector(engine.state);

      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        ...params,
      });
    });

    it('should dispatch #restoreSearchParameters with the original parameters when there is no tab parameter and no tabSet', () => {
      const params = {q: 'a'};
      engine.state.tabSet = {};
      manager.synchronize(params);

      const initialParameters = initialSearchParameterSelector(engine.state);

      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        ...params,
      });
    });

    describe('when there is a tab parameter and a tabSet', () => {
      it('should dispatches #restoreSearchParameters with the tab parameter as the active tab when the tab does not exist in the tabSet and there is an active tab', () => {
        const id1 = 'a';
        const id2 = 'b';
        const tab1 = buildMockTabSlice({id: id1, isActive: false});
        const tab2 = buildMockTabSlice({id: id2, isActive: true});
        engine.state.tabSet = {[id1]: tab1, [id2]: tab2};

        const params = {tab: 'c'};
        manager.synchronize(params);

        expect(restoreSearchParameters).toHaveBeenCalledWith({
          ...initialSearchParameterSelector(engine.state),
          ...params,
          tab: id2,
        });
      });

      it('should dispatches #restoreSearchParameters with the tab parameter as an empty string when there is no active tab', () => {
        const id1 = 'a';
        const id2 = 'b';
        const tab1 = buildMockTabSlice({id: id1, isActive: false});
        const tab2 = buildMockTabSlice({id: id2, isActive: false});
        engine.state.tabSet = {[id1]: tab1, [id2]: tab2};

        const params = {tab: 'c'};
        manager.synchronize(params);

        expect(restoreSearchParameters).toHaveBeenCalledWith({
          ...initialSearchParameterSelector(engine.state),
          ...params,
          tab: '',
        });
      });
    });
  });
});
