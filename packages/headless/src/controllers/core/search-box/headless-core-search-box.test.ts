import {configuration} from '../../../app/common-reducers';
import {query, querySet, querySuggest, search} from '../../../app/reducers';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../../features/breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../../../features/facets/generic/facet-actions';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/query-set/query-set-actions';
import {
  registerQuerySuggest,
  clearQuerySuggest,
  fetchQuerySuggestions,
  selectQuerySuggestion,
} from '../../../features/query-suggest/query-suggest-actions';
import {updateQuery} from '../../../features/query/query-actions';
import {logSearchboxSubmit} from '../../../features/query/query-analytics-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {SearchAppState} from '../../../state/search-app-state';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest';
import {createMockState} from '../../../test/mock-state';
import {
  SearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  buildCoreSearchBox,
} from './headless-core-search-box';

jest.mock('../../../features/query/query-analytics-actions', () => ({
  logSearchboxSubmit: jest.fn(() => () => {}),
}));

describe('headless CoreSearchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockSearchEngine;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    const options: SearchBoxOptions = {
      id,
      numberOfSuggestions: 10,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<a>',
          close: '<a>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '<i>',
        },
      },
    };

    props = {
      options,
      executeSearchActionCreator: executeSearch,
      fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
    };

    initState();
    initController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function initState() {
    state = createMockState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({
      id,
      completions: [
        {
          expression: 'a',
          score: 0,
          executableConfidence: 0,
          highlighted: '[hi]{light}(ed)',
        },
      ],
    });
  }

  function initController() {
    engine = buildMockSearchAppEngine({state});
    searchBox = buildCoreSearchBox(engine, props);
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      query,
      querySuggest,
      configuration,
      querySet,
      search,
    });
  });

  describe('validating options', () => {
    it(`when passing an invalid id as option
      creating the controller should throw`, () => {
      props.options!.id = 1 as unknown as string;
      expect(() => initController()).toThrow();
    });

    it(`when passing an invalid numberOfSuggestions as option
      creating the controller should throw`, () => {
      props.options!.numberOfSuggestions = -2;
      expect(() => initController()).toThrow();
    });

    it(`when passing an invalid highlightOptions as option
      creating the controller should throw`, () => {
      props.options!.highlightOptions = {
        notMatchDelimiters: {
          open: 1 as unknown as string,
          close: 2 as unknown as string,
        },
      };
      expect(() => initController()).toThrow();
    });

    it('when passing an invalid option, it throws an error', () => {
      props.options!.id = 1 as unknown as string;
      expect(() => initController()).toThrow(
        'Check the options of buildSearchBox'
      );
    });
  });

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      value: state.querySet[id],
      suggestions: state.querySuggest[id]!.completions.map((completion) => ({
        highlightedValue: '<a>hi<a>light<i>ed<i>',
        rawValue: completion.expression,
      })),
      isLoading: false,
      isLoadingSuggestions: false,
    });
  });

  it('should dispatch a registerQuerySetQuery action at initialization', () => {
    expect(engine.actions).toContainEqual(
      registerQuerySetQuery({id, query: state.query.q})
    );
  });

  it('should dispatch a registerQuerySuggest action at initialization', () => {
    expect(engine.actions).toContainEqual(
      registerQuerySuggest({
        id,
        count: props.options!.numberOfSuggestions,
      })
    );
  });

  describe('when calling updateText', () => {
    it('updates the search box query in the querySet', () => {
      const text = 'query';
      searchBox.updateText(text);

      const action = updateQuerySetQuery({id, query: text});
      expect(engine.actions).toContainEqual(action);
    });

    it('should call the showSuggestions method', () => {
      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText('how can i fix');

      expect(searchBox.showSuggestions).toHaveBeenCalled();
    });
  });

  it(`when calling clear
      should dispatch a updateQuerySetQuery action`, () => {
    searchBox.clear();
    expect(engine.actions).toContainEqual(
      updateQuerySetQuery({id: id, query: ''})
    );
  });

  it(`when calling clear
      should dispatch a clearQuerySuggest action`, () => {
    searchBox.clear();
    expect(engine.actions).toContainEqual(clearQuerySuggest({id}));
  });

  describe('#showSuggestions', () => {
    it(`when numberOfQuerySuggestions is greater than 0,
      it dispatches fetchQuerySuggestions`, async () => {
      searchBox.showSuggestions();

      const action = engine.actions.find(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );
      expect(action).toEqual(
        fetchQuerySuggestions.pending(action!.meta.requestId, {id})
      );
    });

    it(`when numberOfQuerySuggestions is 0,
      it does not dispatch fetchQuerySuggestions`, () => {
      props.options!.numberOfSuggestions = 0;
      initController();

      searchBox.showSuggestions();

      const action = engine.actions.find(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );

      expect(action).toBe(undefined);
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches a selectQuerySuggestion action', () => {
      const value = 'i like this expression';
      searchBox.selectSuggestion(value);

      expect(engine.actions).toContainEqual(
        selectQuerySuggestion({id, expression: value})
      );
    });

    it('dispatches executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);

      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });
  });

  describe('when calling submit', () => {
    it('it deselects all facets', () => {
      searchBox.submit();

      expect(engine.actions).toContainEqual(deselectAllBreadcrumbs());
      expect(engine.actions).toContainEqual(deselectAllNonBreadcrumbs());
    });

    it('when the #clearFilters option is false, it does not deselects all facets', () => {
      searchBox = buildCoreSearchBox(engine, {
        ...props,
        options: {clearFilters: false},
      });
      searchBox.submit();

      expect(engine.actions).not.toContainEqual(deselectAllBreadcrumbs());
      expect(engine.actions).not.toContainEqual(deselectAllNonBreadcrumbs());
    });

    it('allows autoSelection', () => {
      searchBox.submit();

      expect(engine.actions).toContainEqual(
        updateFacetAutoSelection({allow: true})
      );
    });

    it('autoSelection should be allowed after deselecting facets', () => {
      searchBox.submit();

      const deselectAllBreadcrumbsIndex = engine.actions.findIndex(
        (action) => action.type === deselectAllBreadcrumbs.type
      );
      const updateFacetAutoSelectionIndex = engine.actions.findIndex(
        (action) => action.type === updateFacetAutoSelection.type
      );
      expect(deselectAllBreadcrumbsIndex).toBeLessThanOrEqual(
        updateFacetAutoSelectionIndex
      );
    });

    it('dispatches updateQuery with the correct parameters', () => {
      const expectedQuery = state.querySet[id];
      searchBox.submit();

      const action = updateQuery({
        q: expectedQuery,
        enableQuerySyntax: false,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates the page to the first one', () => {
      searchBox.submit();
      expect(engine.actions).toContainEqual(updatePage(1));
    });

    it('it dispatches an executeSearch action', () => {
      searchBox.submit();

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
      expect(logSearchboxSubmit).toBeCalledTimes(1);
    });

    it('it dispatches a clear suggestions action', () => {
      searchBox.submit();
      expect(engine.actions).toContainEqual(clearQuerySuggest({id}));
    });
  });

  it(`when querySuggest #isLoading state is true,
    #state.isLoadingSuggestions is true`, () => {
    state.querySuggest[id]!.isLoading = true;
    expect(searchBox.state.isLoadingSuggestions).toBe(true);
  });
});
