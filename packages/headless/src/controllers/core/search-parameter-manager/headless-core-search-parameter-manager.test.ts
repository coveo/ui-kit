import {restoreSearchParameters} from '../../../features/search-parameters/search-parameter-actions';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors';
import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';
import {buildMockAutomaticFacetResponse} from '../../../test/mock-automatic-facet-response';
import {buildMockAutomaticFacetSlice} from '../../../test/mock-automatic-facet-slice';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request';
import {buildMockDateFacetRequest} from '../../../test/mock-date-facet-request';
import {buildMockDateFacetSlice} from '../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../test/mock-date-facet-value';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request';
import {buildMockNumericFacetSlice} from '../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value';
import {buildMockSearchParameters} from '../../../test/mock-search-parameters';
import {buildMockStaticFilterSlice} from '../../../test/mock-static-filter-slice';
import {buildMockStaticFilterValue} from '../../../test/mock-static-filter-value';
import {buildMockTabSlice} from '../../../test/mock-tab-state';
import {
  buildCoreSearchParameterManager,
  SearchParameterManager,
  SearchParameterManagerProps,
  validateParams,
} from './headless-core-search-parameter-manager';

describe('search parameter manager', () => {
  let engine: MockSearchEngine;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildCoreSearchParameterManager(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    props = {
      initialState: {
        parameters: {},
      },
    };

    initSearchParameterManager();
  });

  it('exposes a #subscribe method', () => {
    expect(manager.subscribe).toBeTruthy();
  });

  it('exposes a #parameters property under state', () => {
    expect(manager.state.parameters).toBeTruthy();
  });

  it('dispatches #restoreSearchParameters on registration', () => {
    const action = restoreSearchParameters(props.initialState.parameters);
    expect(engine.actions).toContainEqual(action);
  });

  it('throws an error when #parameters is not an object', () => {
    props.initialState.parameters = true as never;
    expect(() => initSearchParameterManager()).toThrow(
      'Check the initialState of buildSearchParameterManager'
    );
  });

  describe('#state.parameters.q', () => {
    it('is included when the parameter does not equal the default value', () => {
      engine.state.query.q = 'a';
      expect(manager.state.parameters.q).toBe('a');
    });

    it('is not included when the parameter is equal to the default value', () => {
      expect(manager.state.parameters).not.toContain('q');
    });
  });

  describe('#state.parameters.tab', () => {
    it('is included when there is an active tab', () => {
      const id = 'a';
      const tab = buildMockTabSlice({id, isActive: true});
      engine.state.tabSet = {[id]: tab};
      expect(manager.state.parameters.tab).toBe(id);
    });

    it('is not included when there is no active tab', () => {
      const id = 'a';
      const tab = buildMockTabSlice({id, isActive: false});
      engine.state.tabSet = {[id]: tab};
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
      engine.state.automaticFacetSet.set = {author: slice};
      expect(manager.state.parameters.af).toEqual({author: ['a']});
    });

    it('is not included when there are no facets with selected values', () => {
      engine.state.automaticFacetSet.set = {
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

    const tab = buildMockTabSlice({id: 'a', isActive: true});
    engine.state.tabSet = {a: tab};

    const automaticFacetValues = [buildMockFacetValue({state: 'selected'})];
    const slice = buildMockAutomaticFacetSlice({
      response: buildMockAutomaticFacetResponse({values: automaticFacetValues}),
    });
    engine.state.automaticFacetSet.set = {a: slice};

    engine.state.query.q = 'a';
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
      const params = {q: 'a'};
      manager.synchronize(params);

      const initialParameters = initialSearchParameterSelector(engine.state);
      const action = restoreSearchParameters({
        ...initialParameters,
        ...params,
      });

      expect(engine.actions).toContainEqual(action);
    });
  });

  describe('#validateParams', () => {
    it('should return true with initial params', () => {
      const initialParameters = initialSearchParameterSelector(engine.state);

      expect(validateParams(engine, initialParameters)).toBe(true);
    });

    describe('with tabs', () => {
      beforeEach(() => {
        engine.state.tabSet = {
          someTab: {id: 'someTab', isActive: true, expression: ''},
          otherTab: {id: 'otherTab', isActive: false, expression: ''},
        };
      });

      it('should return true with an existing tab parameter', () => {
        const initialParameters = initialSearchParameterSelector(engine.state);

        expect(
          validateParams(engine, {...initialParameters, tab: 'someTab'})
        ).toBe(true);
        expect(
          validateParams(engine, {...initialParameters, tab: 'otherTab'})
        ).toBe(true);
      });

      it('should return false with a non-existing tab parameter', () => {
        const initialParameters = initialSearchParameterSelector(engine.state);

        expect(
          validateParams(engine, {...initialParameters, tab: 'notMyTab'})
        ).toBe(false);
      });
    });
  });
});
