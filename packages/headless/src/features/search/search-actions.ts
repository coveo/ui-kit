import {createAsyncThunk, ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {SearchPageState} from '../../state';
import {SearchAction} from '../analytics/analytics-actions';
import {snapshot} from '../history/history-actions';
import {SearchResponse} from '../../api/search/search/search-response';
import {logDidYouMeanAutomatic} from '../did-you-mean/did-you-mean-analytics-actions';
import {didYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {updateQuery} from '../query/query-actions';

/**
 * Executes a search query.
 */
export const executeSearch = createAsyncThunk(
  'search/executeSearch',
  async (analyticsAction: SearchAction, {getState, dispatch}) => {
    const state = getState() as SearchPageState;
    const fetched = await fetchFromAPI(state);
    dispatch(analyticsAction);

    if (!shouldReExecuteTheQueryWithCorrections(state, fetched.response)) {
      dispatch(snapshot(extractHistory(state)));
      return {...fetched, automaticallyCorrected: false};
    }

    const retried = await automaticallyRetryQueryWithCorrection(
      fetched.response.queryCorrections[0].correctedQuery,
      getState,
      dispatch
    );
    dispatch(snapshot(extractHistory(getState() as SearchPageState)));
    return retried;
  }
);

const automaticallyRetryQueryWithCorrection = async (
  correction: string,
  getState: () => unknown,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  dispatch(updateQuery({q: correction}));
  const fetched = await fetchFromAPI(getState() as SearchPageState);
  dispatch(logDidYouMeanAutomatic());
  dispatch(didYouMeanCorrection(correction));
  return {...fetched, automaticallyCorrected: true};
};

const fetchFromAPI = async (state: SearchPageState) => {
  const startedAt = new Date().getTime();
  const response = await SearchAPIClient.search(state);
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query.q;
  return {response, duration, queryExecuted};
};

const shouldReExecuteTheQueryWithCorrections = (
  state: SearchPageState,
  res: SearchResponse
) => {
  if (
    state.didYouMean.enableDidYouMean === true &&
    res.results.length === 0 &&
    res.queryCorrections.length !== 0
  ) {
    return true;
  }
  return false;
};

const extractHistory = (state: SearchPageState) => ({
  context: state.context,
  facetSet: state.facetSet,
  pagination: state.pagination,
  query: state.query,
  querySet: state.querySet,
  sortCriteria: state.sortCriteria,
});
