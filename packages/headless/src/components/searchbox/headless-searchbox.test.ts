import {HeadlessState} from '../../state';
import {Engine} from '../../app/headless-engine';
import {createMockStore, MockStore} from '../../utils/mock-store';
import {Store} from '../../app/store';
import {Searchbox, SearchOptions} from './headless-searchbox';
import {
  registerQuerySuggest,
  updateQuerySuggestQuery,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  selectQuerySuggestion,
} from '../../features/query-suggest/query-suggest-slice';
import {checkForRedirection} from '../../features/redirection/redirection-slice';

const fakeState = {
  querySuggest: {
    q: 'some value',
    completions: [
      {expression: 'some value something'},
      {expression: 'some value some other thing'},
    ],
  },
  redirection: {redirectTo: 'coveo.com'},
  query: {q: 'some query'},
} as HeadlessState;

describe('headless searchbox', () => {
  let engine: Engine;
  let store: MockStore;
  let searchbox: Searchbox;
  let searchboxOptions: SearchOptions;

  beforeEach(() => {
    searchboxOptions = {
      isStandalone: true,
      numberOfQuerySuggestions: 10,
    };
    initComponent();
  });

  function initComponent() {
    store = createMockStore();
    engine = {
      state: {...fakeState},
      store: store as Store,
    } as Engine;
    searchbox = new Searchbox(engine, searchboxOptions);
  }

  it('should return the right state', () => {
    expect(searchbox.state).toEqual({
      value: fakeState.querySuggest.q,
      suggestions: fakeState.querySuggest.completions.map(completion => ({
        value: completion.expression,
      })),
      redirectTo: fakeState.redirection.redirectTo,
    });
  });

  it('should dispatch a registerQuerySuggest action at initialization ', () => {
    expect(store.getActions()[0]).toEqual(
      registerQuerySuggest({
        q: fakeState.query.q,
        count: searchboxOptions.numberOfQuerySuggestions,
      })
    );
  });

  describe('when calling updateText', () => {
    it(`should dispatch a updateQuerySuggestQuery action`, () => {
      searchbox.updateText({value: 'how can i fix'});
      expect(store.getActions()[1]).toEqual(
        updateQuerySuggestQuery({
          q: 'how can i fix',
        })
      );
    });

    it(`when the numberOfQuerySuggestions option is higher than 0
    should call the showSuggestions method`, () => {
      jest.spyOn(searchbox, 'showSuggestions');
      searchbox.updateText({value: 'how can i fix'});

      expect(searchbox.showSuggestions).toHaveBeenCalled();
    });

    it(`when the numberOfQuerySuggestions option is 0
    should not call the showSuggestions method`, () => {
      searchboxOptions.numberOfQuerySuggestions = 0;
      initComponent();

      jest.spyOn(searchbox, 'showSuggestions');
      searchbox.updateText({value: 'how can i fix'});

      expect(searchbox.showSuggestions).not.toHaveBeenCalled();
    });
  });

  it(`when calling clear
    should dispatch a clearQuerySuggest action`, () => {
    searchbox.clear();
    expect(store.getActions()[1]).toEqual(clearQuerySuggest());
  });

  it(`when calling hideSuggestions
    should dispatch a clearQuerySuggestCompletions action`, () => {
    searchbox.hideSuggestions();
    expect(store.getActions()[1]).toEqual(clearQuerySuggestCompletions());
  });

  it(`when calling showSuggestions
    should dispatch a fetchQuerySuggestions action`, () => {
    searchbox.showSuggestions();

    const action = store.getActions()[1];
    expect(action).toEqual(
      fetchQuerySuggestions.pending(action.meta.requestId)
    );
  });

  it(`when calling selectSuggestion
    should dispatch a selectQuerySuggestion action`, () => {
    const value = 'i like this expression';
    searchbox.selectSuggestion({value});
    expect(store.getActions()[1]).toEqual(
      selectQuerySuggestion({expression: value})
    );
  });

  describe('when calling submit', () => {
    it(`when the isStandalone option is true
    should dispatch a checkForRedirection action`, () => {
      searchbox.submit();

      const action = store.getActions()[1];
      expect(action).toEqual(
        checkForRedirection.pending(action.meta.requestId)
      );
    });

    it(`when the isStandalone option is false
    should not dispatch actions`, () => {
      searchboxOptions.isStandalone = false;
      initComponent();
      searchbox.submit();

      expect(store.getActions().length).toBe(1);
    });
  });
});
