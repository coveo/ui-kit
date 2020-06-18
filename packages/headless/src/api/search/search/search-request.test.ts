import {searchRequestParams} from './search-request';
import {createMockState} from '../../../test/mock-state';
import {SearchPageState} from '../../../state';

describe('search request', () => {
  let state: SearchPageState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#searchRequestParams returns the state #query', () => {
    state.query.q = 'hello';
    const params = searchRequestParams(state);

    expect(params.q).toBe(state.query.q);
  });

  it('#searchRequestParams returns the state #sortCriteria', () => {
    state.sortCriteria = 'qre';
    const params = searchRequestParams(state);

    expect(params.sortCriteria).toBe(state.sortCriteria);
  });

  it('#searchRequestParams returns the state #numberOfResults', () => {
    state.pagination.numberOfResults = 10;
    const params = searchRequestParams(state);

    expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
  });

  it('#searchRequestParams returns the state #firstResult', () => {
    state.pagination.firstResult = 10;
    const params = searchRequestParams(state);

    expect(params.firstResult).toBe(state.pagination.firstResult);
  });
});
