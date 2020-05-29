import {Engine} from '../../app/headless-engine';
import {createMockStore, MockStore} from '../../utils/mock-store';
import {SearchBox, SearchBoxOptions} from './headless-search-box';
import {
  registerQuerySuggest,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-actions';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {getQuerySuggestInitialState} from '../../features/query-suggest/query-suggest-slice';
import {createMockState} from '../../utils/mock-state';
import {updateQuery} from '../../features/query/query-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../features/query-set/query-set-actions';
import {executeSearch} from '../../features/search/search-actions';

const id = 'search-box-123';
const fakeState = createMockState();
fakeState.redirection.redirectTo = 'coveo.com';
fakeState.querySet[id] = 'query';
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
      value: fakeState.querySet[id],
      suggestions: fakeState.querySuggest[id]!.completions.map(
        (completion) => ({
          value: completion.expression,
        })
      ),
      redirectTo: fakeState.redirection.redirectTo,
    });
  });

  it('should dispatch a registerQuerySetQuery action at initialization', () => {
    const action = registerQuerySetQuery({id: searchBox.id, query: ''});
    expect(store.getActions()[0]).toEqual(action);
  });

  it('should dispatch a registerQuerySuggest action at initialization', () => {
    expect(store.getActions()[1]).toEqual(
      registerQuerySuggest({
        id: searchBox.id,
        q: fakeState.query.q,
        count: searchBoxOptions.numberOfSuggestions,
      })
    );
  });

  describe('when calling updateText', () => {
    it('updates the search box query in the querySet', () => {
      const text = 'query';
      searchBox.updateText(text);

      const action = updateQuerySetQuery({id: searchBox.id, query: text});
      expect(store.getActions()[2]).toEqual(action);
    });

    it(`when the numberOfQuerySuggestions option is higher than 0
    should call the showSuggestions method`, () => {
      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText('how can i fix');

      expect(searchBox.showSuggestions).toHaveBeenCalled();
    });

    it(`when the numberOfQuerySuggestions option is 0
    should not call the showSuggestions method`, () => {
      searchBoxOptions.numberOfSuggestions = 0;
      initComponent();

      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText('how can i fix');

      expect(searchBox.showSuggestions).not.toHaveBeenCalled();
    });
  });

  it(`when calling clear
    should dispatch a clearQuerySuggest action`, () => {
    searchBox.clear();
    expect(store.getActions()[2]).toEqual(
      clearQuerySuggest({id: searchBox.id})
    );
  });

  it(`when calling hideSuggestions
    should dispatch a clearQuerySuggestCompletions action`, () => {
    searchBox.hideSuggestions();
    expect(store.getActions()[2]).toEqual(
      clearQuerySuggestCompletions({id: searchBox.id})
    );
  });

  it(`when calling showSuggestions
    should dispatch a fetchQuerySuggestions action`, () => {
    searchBox.showSuggestions();

    const action = store.getActions()[2];
    expect(action).toEqual(
      fetchQuerySuggestions.pending(action.meta.requestId, {id: searchBox.id})
    );
  });

  it(`when calling selectSuggestion
    should dispatch a selectQuerySuggestion action`, () => {
    const value = 'i like this expression';
    searchBox.selectSuggestion(value);
    expect(store.getActions()[2]).toEqual(
      selectQuerySuggestion({id: searchBox.id, expression: value})
    );
  });

  describe('when calling submit', () => {
    it('sets the query to the search box value kept in the querySet', () => {
      const expectedQuery = fakeState.querySet[searchBox.id];

      searchBox.submit();

      const action = store.getActions()[2];
      expect(action).toEqual(updateQuery({q: expectedQuery}));
    });

    it(`when the isStandalone option is true
    should dispatch a checkForRedirection action`, () => {
      searchBox.submit();

      const action = store.getActions()[3];
      expect(action).toEqual(
        checkForRedirection.pending(action.meta.requestId)
      );
    });

    it(`when the isStandalone option is false
    it dispatches an executeSearch action`, () => {
      searchBoxOptions.isStandalone = false;
      initComponent();
      searchBox.submit();

      const action = store.getActions()[3];
      expect(action).toEqual(executeSearch.pending(action.meta.requestId));
    });
  });
});
