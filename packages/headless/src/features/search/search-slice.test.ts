import {
  searchReducer,
  getSearchInitialState,
  SearchState,
} from './search-slice';
import {executeSearch} from './search-actions';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearch} from '../../test/mock-search';
import {logGenericSearchEvent} from '../analytics/analytics-actions';

describe('search-slice', () => {
  let state: SearchState;

  beforeEach(() => {
    state = getSearchInitialState();
  });

  it('loads with an initial state', () => {
    const finalState = searchReducer(undefined, {type: ''});
    expect(finalState).toEqual(getSearchInitialState());
  });

  it('the initial response #totalCountFiltered is 0', () => {
    expect(state.response.totalCountFiltered).toBe(0);
  });

  it('when a executeSearch fulfilled is received, it updates the state to the received payload', () => {
    const result = buildMockResult();
    const response = buildMockSearchResponse({results: [result]});
    const searchState = buildMockSearch({response, duration: 123});

    const action = executeSearch.fulfilled(
      searchState,
      '',
      logGenericSearchEvent({evt: 'foo'})
    );
    const finalState = searchReducer(state, action);

    expect(finalState.response).toEqual(response);
    expect(finalState.duration).toEqual(123);
  });
});
