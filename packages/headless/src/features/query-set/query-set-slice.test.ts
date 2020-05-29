import {
  querySetReducer,
  QuerySetState,
  getQuerySetInitialState,
} from './query-set-slice';
import {registerQuerySetQuery, updateQuerySetQuery} from './query-set-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';

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
});
