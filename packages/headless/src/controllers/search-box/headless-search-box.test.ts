import {
  SearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  buildSearchBox,
} from './headless-search-box';
import {
  registerQuerySuggest,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-actions';
import {createMockState} from '../../test/mock-state';
import {executeSearch} from '../../features/search/search-actions';
import {updateQuery} from '../../features/query/query-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../features/query-set/query-set-actions';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {updatePage} from '../../features/pagination/pagination-actions';
import {SearchAppState} from '../../state/search-app-state';
import {logNoopSearchEvent} from '../../features/analytics/analytics-actions';

describe('headless searchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockEngine<SearchAppState>;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    const options: SearchBoxOptions = {
      id,
      numberOfSuggestions: 10,
    };

    props = {options};

    initState();
    initController();
  });

  function initState() {
    state = createMockState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({id, q: 'some value'});
  }

  function initController() {
    engine = buildMockSearchAppEngine({state});
    searchBox = buildSearchBox(engine, props);
  }

  describe('validating options', () => {
    it(`when passing an invalid id as option
    creating the controller should throw`, () => {
      props.options.id = (1 as unknown) as string;
      expect(() => initController()).toThrow();
    });

    it(`when passing an invalid numberOfSuggestions as option
    creating the controller should throw`, () => {
      props.options.numberOfSuggestions = -2;
      expect(() => initController()).toThrow();
    });

    it('when passing an invalid option, it throws an error', () => {
      props.options.id = (1 as unknown) as string;
      expect(() => initController()).toThrow(
        'Check the options of buildSearchBox'
      );
    });
  });

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      value: state.querySet[id],
      suggestions: state.querySuggest[id]!.completions.map((completion) => ({
        value: completion.expression,
      })),
      isLoading: false,
    });
  });

  it('should dispatch a registerQuerySetQuery action at initialization', () => {
    const action = registerQuerySetQuery({id, query: ''});
    expect(engine.actions).toContainEqual(action);
  });

  it('should dispatch a registerQuerySuggest action at initialization', () => {
    expect(engine.actions).toContainEqual(
      registerQuerySuggest({
        id,
        q: state.query.q,
        count: props.options.numberOfSuggestions,
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

  it(`when calling hideSuggestions
    should dispatch a clearQuerySuggestCompletions action`, () => {
    searchBox.hideSuggestions();
    expect(engine.actions).toContainEqual(clearQuerySuggestCompletions({id}));
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
      props.options.numberOfSuggestions = 0;
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

    it('dispatches executeSearch with a noop search event', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);

      const action = engine.findAsyncAction(executeSearch.pending);
      expect(action && action.meta.arg.toString()).toBe(
        logNoopSearchEvent().toString()
      );
    });
  });

  describe('when calling submit', () => {
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
    });
  });
});
