import {querySetReducer} from './query-set-slice';
import {registerQuerySetQuery, updateQuerySetQuery} from './query-set-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {change} from '../history/history-actions';
import {executeSearch} from '../search/search-actions';
import {buildMockSearch} from '../../test/mock-search';
import {getQuerySetInitialState, QuerySetState} from './query-set-state';
import {getHistoryInitialState} from '../history/history-state';

describe('querySet slice', () => {
  let state: QuerySetState;

  function registerEmptyQueryWithId(id: string) {
    const action = registerQuerySetQuery({id, query: ''});
    state = querySetReducer(state, action);
  }

  beforeEach(() => {
    state = getQuerySetInitialState();
  });

  it('initializes the reducer with the initial state', () => {
    const finalState = querySetReducer(undefined, {type: ''});
    expect(finalState).toEqual(getQuerySetInitialState());
  });

  it('registers a query', () => {
    const id = '1';
    const query = 'query';

    const action = registerQuerySetQuery({id, query});
    const finalState = querySetReducer(state, action);

    expect(finalState[id]).toBe(query);
  });

  it('does not register a second query on the same id', () => {
    const id = '1';
    const query = 'query';

    registerEmptyQueryWithId(id);
    const action = registerQuerySetQuery({id, query});
    const finalState = querySetReducer(state, action);

    expect(finalState[id]).toBe(state[id]);
  });

  it('does not update the query if the id does not exist', () => {
    const id = '1';
    const query = 'query';
    const action = updateQuerySetQuery({id, query});

    const finalState = querySetReducer(state, action);
    expect(finalState[id]).toBe(undefined);
  });

  it('updates the query if the id exists', () => {
    const id = '1';
    const query = 'query';

    registerEmptyQueryWithId(id);
    const action = updateQuerySetQuery({id, query});
    const finalState = querySetReducer(state, action);

    expect(finalState[id]).toBe(query);
  });

  it(`when a query suggestion is selected,
  it updates the query if the id exists`, () => {
    const id = '1';
    const query = 'query';

    registerEmptyQueryWithId(id);
    const action = selectQuerySuggestion({id, expression: query});
    const finalState = querySetReducer(state, action);

    expect(finalState[id]).toBe(query);
  });

  it(`when a query suggestion is selected,
  it does not update the query if the id does not exist`, () => {
    const id = '1';

    const action = selectQuerySuggestion({id, expression: 'query'});
    const finalState = querySetReducer(state, action);

    expect(finalState[id]).toBe(undefined);
  });

  it('sets all queries to queryExecuted on executeSearch.fulfilled', () => {
    registerEmptyQueryWithId('foo');
    registerEmptyQueryWithId('bar');

    const expectedQuerySet = {foo: 'world', bar: 'world'};
    const searchState = buildMockSearch({queryExecuted: 'world'});
    const nextState = querySetReducer(
      state,
      executeSearch.fulfilled(searchState, '', logSearchboxSubmit())
    );
    expect(nextState).toEqual(expectedQuerySet);
  });

  it('allows to restore a query set on history change', () => {
    registerEmptyQueryWithId('foo');
    registerEmptyQueryWithId('hello');

    const expectedQuerySet = {foo: 'bar', hello: 'world'};
    const historyChange = {
      ...getHistoryInitialState(),
      querySet: expectedQuerySet,
    };

    const nextState = querySetReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual(expectedQuerySet);
  });
});
