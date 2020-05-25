import {Engine} from '../../app/headless-engine';
import {createMockStore, MockStore} from '../../utils/mock-store';
import {SearchBox, SearchBoxOptions} from './headless-search-box';
import {
  registerQuerySuggest,
  updateQuerySuggestQuery,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-actions';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {getQuerySuggestInitialState} from '../../features/query-suggest/query-suggest-slice';
import {createMockState} from '../../utils/mock-state';

const id = 'search-box-123';
const fakeState = createMockState();
fakeState.query.q = 'some query';
fakeState.redirection.redirectTo = 'coveo.com';
fakeState.querySuggest[id] = {
  ...getQuerySuggestInitialState(),
  id,
  q: 'some value',
  completions: [
    {
      expression: 'some value something',
      executableConfidence: 1,
      score: 1,
      highlighted: '≤b>some value</b> something',
    },
    {
      expression: 'some value some other thing',
      executableConfidence: 1,
      score: 1,
      highlighted: '≤b>some value</b> some other thing',
    },
  ],
};

describe('headless searchBox', () => {
  let engine: Engine;
  let store: MockStore;
  let searchBox: SearchBox;
  let searchBoxOptions: SearchBoxOptions;

  beforeEach(() => {
    searchBoxOptions = {
      id,
      isStandalone: true,
      numberOfSuggestions: 10,
    };
    initComponent();
  });

  function initComponent() {
    store = createMockStore();
    engine = {
      state: {...fakeState},
      dispatch: store.dispatch,
    } as Engine;
    searchBox = new SearchBox(engine, searchBoxOptions);
  }

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      value: fakeState.querySuggest[id]!.q,
      suggestions: fakeState.querySuggest[id]!.completions.map(
        (completion) => ({
          value: completion.expression,
        })
      ),
      redirectTo: fakeState.redirection.redirectTo,
    });
  });

  it('should dispatch a registerQuerySuggest action at initialization', () => {
    expect(store.getActions()[0]).toEqual(
      registerQuerySuggest({
        id: searchBox.id,
        q: fakeState.query.q,
        count: searchBoxOptions.numberOfSuggestions,
      })
    );
  });

  describe('when calling updateText', () => {
    it('should dispatch a updateQuerySuggestQuery action', () => {
      searchBox.updateText({value: 'how can i fix'});
      expect(store.getActions()[1]).toEqual(
        updateQuerySuggestQuery({
          id: searchBox.id,
          q: 'how can i fix',
        })
      );
    });

    it(`when the numberOfQuerySuggestions option is higher than 0
    should call the showSuggestions method`, () => {
      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText({value: 'how can i fix'});

      expect(searchBox.showSuggestions).toHaveBeenCalled();
    });

    it(`when the numberOfQuerySuggestions option is 0
    should not call the showSuggestions method`, () => {
      searchBoxOptions.numberOfSuggestions = 0;
      initComponent();

      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText({value: 'how can i fix'});

      expect(searchBox.showSuggestions).not.toHaveBeenCalled();
    });
  });

  it(`when calling clear
    should dispatch a clearQuerySuggest action`, () => {
    searchBox.clear();
    expect(store.getActions()[1]).toEqual(
      clearQuerySuggest({id: searchBox.id})
    );
  });

  it(`when calling hideSuggestions
    should dispatch a clearQuerySuggestCompletions action`, () => {
    searchBox.hideSuggestions();
    expect(store.getActions()[1]).toEqual(
      clearQuerySuggestCompletions({id: searchBox.id})
    );
  });

  it(`when calling showSuggestions
    should dispatch a fetchQuerySuggestions action`, () => {
    searchBox.showSuggestions();

    const action = store.getActions()[1];
    expect(action).toEqual(
      fetchQuerySuggestions.pending(action.meta.requestId, {id: searchBox.id})
    );
  });

  it(`when calling selectSuggestion
    should dispatch a selectQuerySuggestion action`, () => {
    const value = 'i like this expression';
    searchBox.selectSuggestion({value});
    expect(store.getActions()[1]).toEqual(
      selectQuerySuggestion({id: searchBox.id, expression: value})
    );
  });

  describe('when calling submit', () => {
    it(`when the isStandalone option is true
    should dispatch a checkForRedirection action`, () => {
      searchBox.submit();

      const action = store.getActions()[1];
      expect(action).toEqual(
        checkForRedirection.pending(action.meta.requestId)
      );
    });

    it(`when the isStandalone option is false
    should not dispatch actions`, () => {
      searchBoxOptions.isStandalone = false;
      initComponent();
      searchBox.submit();

      expect(store.getActions().length).toBe(1);
    });
  });
});
