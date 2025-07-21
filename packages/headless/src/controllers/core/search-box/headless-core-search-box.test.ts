import {configuration} from '../../../app/common-reducers.js';
import {logSearchboxSubmit} from '../../../features/query/query-analytics-actions.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/query-set/query-set-actions.js';
import {querySetReducer as querySet} from '../../../features/query-set/query-set-slice.js';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/query-suggest/query-suggest-actions.js';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice.js';
import {
  executeSearch,
  prepareForSearchWithQuery,
} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {SearchAppState} from '../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreSearchBox,
  type SearchBox,
  type SearchBoxOptions,
  type SearchBoxProps,
} from './headless-core-search-box.js';

vi.mock('../../../features/query/query-analytics-actions', () => ({
  logSearchboxSubmit: vi.fn(() => () => {}),
}));
vi.mock('../../../features/query-suggest/query-suggest-actions');
vi.mock('../../../features/query-set/query-set-actions');
vi.mock('../../../features/search/search-actions');

describe('headless CoreSearchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockedSearchEngine;
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
      isNextAnalyticsReady: true,
    };

    initState();
    initController();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
    engine = buildMockSearchEngine(state);
    searchBox = buildCoreSearchBox(engine, props);
  }

  it('adds the correct reducers to engine', () => {
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
      searchBoxId: id,
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
    expect(registerQuerySetQuery).toHaveBeenCalledWith({
      id,
      query: state.query.q,
    });
  });

  it('should dispatch a registerQuerySuggest action at initialization', () => {
    expect(registerQuerySuggest).toHaveBeenCalledWith({
      id,
      count: props.options!.numberOfSuggestions,
    });
  });

  describe('when calling updateText', () => {
    it('updates the search box query in the querySet', () => {
      const text = 'query';
      searchBox.updateText(text);
      expect(updateQuerySetQuery).toHaveBeenCalledWith({id, query: text});
    });

    it('should call the showSuggestions method', () => {
      vi.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText('how can i fix');

      expect(searchBox.showSuggestions).toHaveBeenCalled();
    });
  });

  it(`when calling clear
      should dispatch a updateQuerySetQuery action`, () => {
    searchBox.clear();
    expect(updateQuerySetQuery).toHaveBeenCalledWith({id, query: ''});
  });

  it(`when calling clear
      should dispatch a clearQuerySuggest action`, () => {
    searchBox.clear();
    expect(clearQuerySuggest).toHaveBeenCalledWith({id});
  });

  describe('#showSuggestions', () => {
    it(`when numberOfQuerySuggestions is greater than 0,
      it dispatches fetchQuerySuggestions`, async () => {
      searchBox.showSuggestions();
      expect(fetchQuerySuggestions).toHaveBeenCalledWith({id});
    });

    it(`when numberOfQuerySuggestions is 0,
      it does not dispatch fetchQuerySuggestions`, () => {
      props.options!.numberOfSuggestions = 0;
      initController();

      searchBox.showSuggestions();
      expect(fetchQuerySuggestions).not.toHaveBeenCalled();
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches a selectQuerySuggestion action', () => {
      const value = 'i like this expression';
      searchBox.selectSuggestion(value);
      expect(selectQuerySuggestion).toHaveBeenCalledWith({
        id,
        expression: value,
      });
    });

    it('dispatches executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('when calling submit', () => {
    it('clears filters with #prepareForSearchWithQuery if #clearFilters options is set to true', () => {
      searchBox.submit();
      expect(prepareForSearchWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          clearFilters: true,
        })
      );
    });

    it('does not clear filters with #prepareForSearchWithQuery if #clearFilters option is set to false', () => {
      searchBox = buildCoreSearchBox(engine, {
        ...props,
        options: {clearFilters: false},
      });
      searchBox.submit();
      expect(prepareForSearchWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          clearFilters: false,
        })
      );
    });

    it('dispatches #prepareForSearchWithQuery with the correct query parameters', () => {
      const expectedQuery = state.querySet[id];
      searchBox.submit();

      expect(prepareForSearchWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          q: expectedQuery,
          enableQuerySyntax: false,
        })
      );
    });

    it('it dispatches an executeSearch action', () => {
      searchBox.submit();
      expect(executeSearch).toHaveBeenCalled();
      expect(logSearchboxSubmit).toHaveBeenCalledTimes(1);
    });

    it('it dispatches a clear suggestions action', () => {
      searchBox.submit();
      expect(clearQuerySuggest).toHaveBeenCalledWith({id});
    });
  });

  it(`when querySuggest #isLoading state is true,
    #state.isLoadingSuggestions is true`, () => {
    state.querySuggest[id]!.isLoading = true;
    expect(searchBox.state.isLoadingSuggestions).toBe(true);
  });
});
