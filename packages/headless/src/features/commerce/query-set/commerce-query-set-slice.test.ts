import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import {
  getQuerySetInitialState,
  type QuerySetState,
} from '../../query-set/query-set-state.js';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions.js';
import {
  executeSearch,
  type QuerySearchCommerceAPIThunkReturn,
} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {commerceQuerySetReducer} from './commerce-query-set-slice.js';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set-actions.js';

describe('commerce querySet slice', () => {
  let state: QuerySetState;

  function registerQueryWithId(id: string, query = '') {
    const action = registerQuerySetQuery({id, query});
    state = commerceQuerySetReducer(state, action);
  }

  beforeEach(() => {
    state = getQuerySetInitialState();
  });

  it('initializes the reducer with the initial state', () => {
    const finalState = commerceQuerySetReducer(undefined, {type: ''});
    expect(finalState).toEqual(getQuerySetInitialState());
  });

  it('registers a query', () => {
    const id = '1';
    const query = 'query';

    const action = registerQuerySetQuery({id, query});
    const finalState = commerceQuerySetReducer(state, action);

    expect(finalState[id]).toBe(query);
  });

  it('does not register a second query on the same id', () => {
    const id = '1';
    const query = 'query';

    registerQueryWithId(id);
    const action = registerQuerySetQuery({id, query});
    const finalState = commerceQuerySetReducer(state, action);

    expect(finalState[id]).toBe(state[id]);
  });

  it('does not update the query if the id does not exist', () => {
    const id = '1';
    const query = 'query';
    const action = updateQuerySetQuery({id, query});

    const finalState = commerceQuerySetReducer(state, action);
    expect(finalState[id]).toBe(undefined);
  });

  it('updates the query if the id exists', () => {
    const id = '1';
    const query = 'query';

    registerQueryWithId(id);
    const action = updateQuerySetQuery({id, query});
    const finalState = commerceQuerySetReducer(state, action);

    expect(finalState[id]).toBe(query);
  });

  describe('#selectQuerySuggestion', () => {
    it('updates the query if the id exists', () => {
      const id = '1';
      const query = 'query';

      registerQueryWithId(id);
      const action = selectQuerySuggestion({id, expression: query});
      const finalState = commerceQuerySetReducer(state, action);

      expect(finalState[id]).toBe(query);
    });

    it('does not update the query if the id does not exist', () => {
      const id = '1';

      const action = selectQuerySuggestion({id, expression: 'query'});
      const finalState = commerceQuerySetReducer(state, action);

      expect(finalState[id]).toBe(undefined);
    });
  });

  it('sets all queries to queryExecuted on executeSearch.fulfilled', () => {
    registerQueryWithId('foo');
    registerQueryWithId('bar');

    const expectedQuerySet = {foo: 'world', bar: 'world'};
    const nextState = commerceQuerySetReducer(
      state,
      executeSearch.fulfilled(
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

  it('sets all queries to q on #restoreSearchParameters, when "q" defined', () => {
    registerQueryWithId('foo');
    registerQueryWithId('bar');

    const expectedQuerySet = {foo: 'world', bar: 'world'};
    const nextState = commerceQuerySetReducer(
      state,
      restoreSearchParameters({q: 'world'})
    );
    expect(nextState).toEqual(expectedQuerySet);
  });

  it('does not modify query on #restoreSearchParameters, when "q" not defined', () => {
    registerQueryWithId('foo', 'foo');
    registerQueryWithId('bar', 'bar');

    const expectedQuerySet = {foo: 'foo', bar: 'bar'};
    const nextState = commerceQuerySetReducer(
      state,
      restoreSearchParameters({})
    );
    expect(nextState).toEqual(expectedQuerySet);
  });
});
