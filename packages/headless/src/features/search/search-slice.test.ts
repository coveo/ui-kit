import {
  searchReducer,
  getSearchInitialState,
  SearchState,
} from './search-slice';
import {executeSearch} from './search-actions';
import {buildMockSearchResponse} from '../../test/mock-search-response';

describe('search-slice', () => {
  let state: SearchState;

  beforeEach(() => {
    state = getSearchInitialState();
  });

  it('loads with an initial state', () => {
    const finalState = searchReducer(undefined, {type: ''});
    expect(finalState).toEqual(getSearchInitialState());
  });

  it('when a executeSearch fulfilled is received, it updates the state to the received payload', () => {
    const response = buildMockSearchResponse();

    const action = executeSearch.fulfilled({response, duration: 123}, '');
    const finalState = searchReducer(state, action);

    expect(finalState.response).toEqual(response);
    expect(finalState.duration).toEqual(123);
  });
});
