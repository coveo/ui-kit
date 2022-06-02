import {insightSearchReducer} from './insight-search-slice';
import {
  getInsightSearchInitialState,
  InsightSearchState,
} from './insight-search-state';

describe('insight search slice', () => {
  let state: InsightSearchState;

  beforeEach(() => {
    state = getInsightSearchInitialState();
  });

  it('loads with an initial state', () => {
    const finalState = insightSearchReducer(undefined, {type: ''});
    expect(finalState).toEqual(getInsightSearchInitialState());
  });

  it('the initial isloading state is set to false', () => {
    expect(state.isLoading).toBe(false);
  });
});
