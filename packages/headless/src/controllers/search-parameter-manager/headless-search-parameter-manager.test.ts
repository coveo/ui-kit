import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetValueRequest} from '../../test/mock-category-facet-value-request';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetValueRequest} from '../../test/mock-facet-value-request';
import {buildMockSearchParameters} from '../../test/mock-search-parameters';
import {
  buildSearchParameterManager,
  SearchParameterManager,
  SearchParameterManagerProps,
} from './headless-search-parameter-manager';

describe('state manager', () => {
  let engine: MockEngine<SearchAppState>;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildSearchParameterManager(engine, props);
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

  it('when #parameters is not an object, it throws an error', () => {
    props.initialState.parameters = true as never;
    expect(() => initSearchParameterManager()).toThrow(
      'Check the initialState of buildSearchParameterManager'
    );
  });

  describe('#state.parameters.q', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.query.q = 'a';
      expect(manager.state.parameters.q).toBe('a');
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('q' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.enableQuerySyntax', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.query.enableQuerySyntax = true;
      expect(manager.state.parameters.enableQuerySyntax).toBe(true);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('enableQuerySyntax' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.aq', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.advancedSearchQueries.aq = 'a';
      expect(manager.state.parameters.aq).toBe('a');
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('aq' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.cq', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.advancedSearchQueries.cq = 'a';
      expect(manager.state.parameters.cq).toBe('a');
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('cq' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.firstResult', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.pagination.firstResult = 1;
      expect(manager.state.parameters.firstResult).toBe(1);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('firstResult' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.numberOfResults', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.pagination.numberOfResults = 1;
      expect(manager.state.parameters.numberOfResults).toBe(1);
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('numberOfResults' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.f', () => {
    it('when a facet has selected values, only selected values are included', () => {
      const selected = buildMockFacetValueRequest({
        value: 'a',
        state: 'selected',
      });
      const idle = buildMockFacetValueRequest({value: 'b', state: 'idle'});

      const currentValues = [selected, idle];
      engine.state.facetSet = {author: buildMockFacetRequest({currentValues})};

      expect(manager.state.parameters.f).toEqual({author: ['a']});
    });

    it('when there are no facets with selected values, the #f parameter is not included', () => {
      engine.state.facetSet = {author: buildMockFacetRequest()};
      expect('f' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.cf', () => {
    it('when a category facet has selected values, only selected values are included', () => {
      const selected = buildMockCategoryFacetValueRequest({
        value: 'a',
        state: 'selected',
      });

      const idle = buildMockCategoryFacetValueRequest({
        value: 'b',
        state: 'idle',
      });

      engine.state.categoryFacetSet = {
        author: buildMockCategoryFacetRequest({
          currentValues: [selected, idle],
        }),
      };

      expect(manager.state.parameters.cf).toEqual({author: ['a']});
    });

    it('when a category facet has a nested selection, the full path is included', () => {
      const child = buildMockCategoryFacetValueRequest({
        value: 'b',
        state: 'selected',
      });

      const parent = buildMockCategoryFacetValueRequest({
        value: 'a',
        children: [child],
      });

      engine.state.categoryFacetSet = {
        author: buildMockCategoryFacetRequest({currentValues: [parent]}),
      };

      expect(manager.state.parameters.cf).toEqual({author: ['a', 'b']});
    });

    it('when there are no category facets with selected values, the #cf parameter is not included', () => {
      engine.state.categoryFacetSet = {author: buildMockCategoryFacetRequest()};
      expect('cf' in manager.state.parameters).toBe(false);
    });
  });

  describe('#state.parameters.sortCriteria', () => {
    it('when the parameter does not equal the default value, it is included', () => {
      engine.state.sortCriteria = 'qre';
      expect(manager.state.parameters.sortCriteria).toBe('qre');
    });

    it('when the parameter is equal to the default value, it is not included', () => {
      expect('numberOfResults' in manager.state.parameters).toBe(false);
    });
  });

  it(`given a certain initial state,
  it is possible to access every search parameter using #state.parameters`, () => {
    const facetValues = [buildMockFacetValueRequest({state: 'selected'})];
    engine.state.facetSet = {
      author: buildMockFacetRequest({currentValues: facetValues}),
    };

    const categoryFacetValues = [
      buildMockCategoryFacetValueRequest({state: 'selected'}),
    ];
    engine.state.categoryFacetSet = {
      author: buildMockCategoryFacetRequest({
        currentValues: categoryFacetValues,
      }),
    };

    engine.state.query.q = 'a';
    engine.state.query.enableQuerySyntax = true;
    engine.state.advancedSearchQueries.aq = 'a';
    engine.state.advancedSearchQueries.cq = 'a';
    engine.state.pagination.firstResult = 1;
    engine.state.pagination.numberOfResults = 1;
    engine.state.sortCriteria = 'qre';

    const stateParams = manager.state.parameters;
    const allKeys = Object.keys(buildMockSearchParameters());
    const unavailableKeys = allKeys.filter((key) => !(key in stateParams));

    expect(unavailableKeys).toEqual([]);
  });
});
