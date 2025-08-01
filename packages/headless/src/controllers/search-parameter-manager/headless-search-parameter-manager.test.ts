import {executeSearch} from '../../features/search/search-actions.js';
import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions.js';
import {initialSearchParameterSelector} from '../../features/search-parameters/search-parameter-selectors.js';
import {buildMockAutomaticFacetResponse} from '../../test/mock-automatic-facet-response.js';
import {buildMockAutomaticFacetSlice} from '../../test/mock-automatic-facet-slice.js';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice.js';
import {buildMockCategoryFacetValueRequest} from '../../test/mock-category-facet-value-request.js';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request.js';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockFacetRequest} from '../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../test/mock-facet-value.js';
import {buildMockFacetValueRequest} from '../../test/mock-facet-value-request.js';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../test/mock-numeric-facet-value.js';
import {buildMockSearchParameters} from '../../test/mock-search-parameters.js';
import {createMockState} from '../../test/mock-state.js';
import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice.js';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value.js';
import {buildMockTabSlice} from '../../test/mock-tab-state.js';
import {
  buildSearchParameterManager,
  type SearchParameterManager,
  type SearchParameterManagerProps,
} from './headless-search-parameter-manager.js';

vi.mock('../../features/search-parameters/search-parameter-actions');
vi.mock('../../features/search/search-actions');

describe('search parameter manager', () => {
  let engine: MockedSearchEngine;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildSearchParameterManager(engine, props);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    props = {
      initialState: {
        parameters: {},
      },
    };

    initSearchParameterManager();
  });

  describe('#state.parameters.enableQuerySyntax', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.query!.enableQuerySyntax = true;
      expect(manager.state.parameters.enableQuerySyntax).toBe(true);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('enableQuerySyntax' in manager.state.parameters).toBe(false);
    });

    it('when the parameter is undefined, it is not included', () => {
      engine.state.query!.enableQuerySyntax = undefined as unknown as boolean;
      expect('enableQuerySyntax' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.aq', () => {
    it('when the parameter is not the default, it is included', () => {
      engine.state.advancedSearchQueries!.aq = 'abc';
      engine.state.advancedSearchQueries!.defaultFilters.aq = 'def';
      expect(manager.state.parameters.aq).toBe('abc');
    });

    it('when the parameter is the default, it is not included', () => {
      engine.state.advancedSearchQueries!.aq = 'abc';
      engine.state.advancedSearchQueries!.defaultFilters.aq = 'abc';
      expect('aq' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.cq', () => {
    it('when the parameter is not the default, it is included', () => {
      engine.state.advancedSearchQueries!.cq = 'abc';
      engine.state.advancedSearchQueries!.defaultFilters.cq = 'def';
      expect(manager.state.parameters.cq).toBe('abc');
    });

    it('when the parameter is the default, it is not included', () => {
      engine.state.advancedSearchQueries!.cq = 'abc';
      engine.state.advancedSearchQueries!.defaultFilters.cq = 'abc';
      expect('cq' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.lq', () => {
    it('when the parameter is not the default, it is not included', () => {
      engine.state.advancedSearchQueries!.lq = 'abc';
      engine.state.advancedSearchQueries!.defaultFilters.lq = 'def';
      expect('lq' in manager.state.parameters).toBe(false);
    });

    it('when the parameter is the default, it is not included', () => {
      engine.state.advancedSearchQueries!.lq = 'abc';
      engine.state.advancedSearchQueries!.defaultFilters.lq = 'abc';
      expect('lq' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.firstResult', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.pagination!.firstResult = 1;
      expect(manager.state.parameters.firstResult).toBe(1);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('firstResult' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.numberOfResults', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.pagination!.numberOfResults = 1;
      expect(manager.state.parameters.numberOfResults).toBe(1);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('numberOfResults' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.sf', () => {
    it('when a static filter has a selected value, only selected values are included', () => {
      const id = 'a';
      const selected = buildMockStaticFilterValue({
        caption: 'a',
        state: 'selected',
      });
      const idle = buildMockStaticFilterValue({caption: 'b', state: 'idle'});
      const filter = buildMockStaticFilterSlice({id, values: [selected, idle]});

      engine.state.staticFilterSet = {[id]: filter};
      expect(manager.state.parameters.sf).toEqual({[id]: [selected.caption]});
    });

    it('when no static filters have selected values, the #sf parameter is not included', () => {
      const filter = buildMockStaticFilterSlice();

      engine.state.staticFilterSet = {a: filter};
      expect('sf' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.debug', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.debug = true;
      expect(manager.state.parameters.debug).toBe(true);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('debug' in manager.state.parameters).toBe(false);
    });

    it('when the parameter is undefined, it is not included', () => {
      engine.state.debug = undefined as never;
      expect('debug' in manager.state.parameters).toBe(false);
    });
  });

  it(`given a certain initial state,
  it is possible to access every relevant search parameter using #state.parameters`, () => {
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
    engine.state.automaticFacetSet!.set = {
      a: buildMockAutomaticFacetSlice({
        response: buildMockAutomaticFacetResponse({
          values: automaticFacetValues,
        }),
      }),
    };

    engine.state.query!.q = 'a';
    engine.state.query!.enableQuerySyntax = true;
    engine.state.advancedSearchQueries!.aq = 'someAq';
    engine.state.advancedSearchQueries!.defaultFilters.aq = 'anotherAq';
    engine.state.advancedSearchQueries!.cq = 'someCq';
    engine.state.advancedSearchQueries!.defaultFilters.cq = 'anotherCq';
    engine.state.advancedSearchQueries!.lq = 'someLq';
    engine.state.advancedSearchQueries!.defaultFilters.lq = 'anotherLq';
    engine.state.pagination!.firstResult = 1;
    engine.state.pagination!.numberOfResults = 1;
    engine.state.sortCriteria = 'qre';
    engine.state.debug = true;

    const stateParams = manager.state.parameters;
    const allKeys = Object.keys(buildMockSearchParameters());
    const unavailableKeys = allKeys.filter((key) => !(key in stateParams));

    expect(unavailableKeys).toEqual([]);
  });

  describe('#synchronize', () => {
    it('given partial search parameters, it dispatches #restoreSearchParameters with non-specified parameters set to their initial values', () => {
      const params = {q: 'a'};
      manager.synchronize(params);

      const initialParameters = initialSearchParameterSelector(engine.state);
      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        ...params,
      });
      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        ...params,
      });
    });

    it('given valid search parameters, executes a search', () => {
      manager.synchronize({q: 'a'});
      expect(executeSearch).toHaveBeenCalled();
    });

    it(`when only the order of facet values changes,
    calling #synchronize does not execute a search`, () => {
      const value1 = 'Kafka';
      const value2 = 'Cervantes';

      const facetValue1 = buildMockFacetValueRequest({
        value: value1,
        state: 'selected',
      });
      const facetValue2 = buildMockFacetValueRequest({
        value: value2,
        state: 'selected',
      });

      engine.state.facetSet = {
        author: buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValue1, facetValue2],
          }),
        }),
      };

      manager.synchronize({f: {author: [value2, value1]}});

      expect(executeSearch).not.toHaveBeenCalled();
    });
  });
});
