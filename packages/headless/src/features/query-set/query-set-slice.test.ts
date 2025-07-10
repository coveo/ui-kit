import type {SearchCommerceSuccessResponse} from '../../api/commerce/search/response.js';
import {buildMockSearch} from '../../test/mock-search.js';
import {selectQuerySuggestion as selectCommerceQuerySuggestion} from '../commerce/query-suggest/query-suggest-actions.js';
import {
  executeSearch as commerceExecuteSearch,
  type QuerySearchCommerceAPIThunkReturn,
} from '../commerce/search/search-actions.js';
import {restoreSearchParameters as commerceRestoreSearchParameters} from '../commerce/search-parameters/search-parameters-actions.js';
import {change} from '../history/history-actions.js';
import {getHistoryInitialState} from '../history/history-state.js';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions.js';
import {
  type ExecuteSearchThunkReturn,
  executeSearch,
} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set-actions.js';
import {querySetReducer} from './query-set-slice.js';
import {
  getQuerySetInitialState,
  type QuerySetState,
} from './query-set-state.js';

describe('querySet slice', () => {
  let state: QuerySetState;

  function registerQueryWithId(id: string, query = '') {
    const action = registerQuerySetQuery({id, query});
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

    registerQueryWithId(id);
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

    registerQueryWithId(id);
    const action = updateQuerySetQuery({id, query});
    const finalState = querySetReducer(state, action);

    expect(finalState[id]).toBe(query);
  });

  const describeSelectSuggestion = (
    selectSuggestion:
      | typeof selectQuerySuggestion
      | typeof selectCommerceQuerySuggestion
  ) => {
    it('updates the query if the id exists', () => {
      const id = '1';
      const query = 'query';

      registerQueryWithId(id);
      const action = selectSuggestion({id, expression: query});
      const finalState = querySetReducer(state, action);

      expect(finalState[id]).toBe(query);
    });

    it('does not update the query if the id does not exist', () => {
      const id = '1';

      const action = selectSuggestion({id, expression: 'query'});
      const finalState = querySetReducer(state, action);

      expect(finalState[id]).toBe(undefined);
    });
  };

  describe('#selectQuerySuggestion', () => {
    describeSelectSuggestion(selectQuerySuggestion);
  });

  describe('#selectCommerceQuerySuggestion', () => {
    describeSelectSuggestion(selectCommerceQuerySuggestion);
  });

  it.each([{action: executeSearch}, {action: commerceExecuteSearch}])(
    'sets all queries to queryExecuted on executeSearch.fulfilled',
    ({action}) => {
      registerQueryWithId('foo');
      registerQueryWithId('bar');

      const expectedQuerySet = {foo: 'world', bar: 'world'};
      const searchState = buildMockSearch({queryExecuted: 'world'});
      const nextState = querySetReducer(
        state,
        action.fulfilled(
          searchState as unknown as ExecuteSearchThunkReturn &
            QuerySearchCommerceAPIThunkReturn,
          ''
        )
      );
      expect(nextState).toEqual(expectedQuerySet);
    }
  );

  it('sets all queries to queryExecuted on commerce executeSearch.fulfilled', () => {
    registerQueryWithId('foo');
    registerQueryWithId('bar');

    const expectedQuerySet = {foo: 'world', bar: 'world'};
    const nextState = querySetReducer(
      state,
      commerceExecuteSearch.fulfilled(
        {
          queryExecuted: 'world',
          response: {
            responseId: 'someid',
          } as unknown as SearchCommerceSuccessResponse,
        } as QuerySearchCommerceAPIThunkReturn,
        ''
      )
    );
    expect(nextState).toEqual(expectedQuerySet);
  });

  it.each([
    {action: restoreSearchParameters},
    {action: commerceRestoreSearchParameters},
  ])('sets all queries to q on #$action, when "q" defined', ({action}) => {
    registerQueryWithId('foo');
    registerQueryWithId('bar');

    const expectedQuerySet = {foo: 'world', bar: 'world'};
    // biome-ignore lint/suspicious/noExplicitAny: <>
    const nextState = querySetReducer(state, (action as any)({q: 'world'}));
    expect(nextState).toEqual(expectedQuerySet);
  });

  it.each([
    {
      action: restoreSearchParameters,
    },
    {
      action: commerceRestoreSearchParameters,
    },
  ])('does not modify query on #$action, when "q" not defined', ({action}) => {
    registerQueryWithId('foo', 'foo');
    registerQueryWithId('bar', 'bar');

    const expectedQuerySet = {foo: 'foo', bar: 'bar'};
    // biome-ignore lint/suspicious/noExplicitAny: <>
    const nextState = querySetReducer(state, (action as any)({}));
    expect(nextState).toEqual(expectedQuerySet);
  });

  it('does not modify query on #$action, when "q" not defined', () => {
    registerQueryWithId('foo', 'foo');
    registerQueryWithId('bar', 'bar');

    const expectedQuerySet = {foo: 'foo', bar: 'bar'};
    const nextState = querySetReducer(state, restoreSearchParameters({}));
    expect(nextState).toEqual(expectedQuerySet);
  });

  it('allows to restore a query set on history change', () => {
    registerQueryWithId('foo');
    registerQueryWithId('hello');

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
