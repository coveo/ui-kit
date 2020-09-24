import {createAsyncThunk, ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {
  SearchAPIClient,
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';
import {SearchPageState} from '../../state';
import {SearchAction} from '../analytics/analytics-actions';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {snapshot} from '../history/history-actions';
import {logDidYouMeanAutomatic} from '../did-you-mean/did-you-mean-analytics-actions';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {updateQuery} from '../query/query-actions';

export interface ExecuteSearchThunkReturn {
  response: SearchResponseSuccess;
  duration: number;
  queryExecuted: string;
  automaticallyCorrected: boolean;
  analyticsAction: SearchAction;
}

const fetchFromAPI = async (
  client: SearchAPIClient,
  state: SearchPageState
) => {
  const startedAt = new Date().getTime();
  const response = await client.search(state);
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query.q;
  return {response, duration, queryExecuted};
};

/**
 * Executes a search query.
 */
export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions
>(
  'search/executeSearch',
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    const state = getState();
    const fetched = await fetchFromAPI(searchAPIClient, state);

    if (isErrorResponse(fetched.response)) {
      return rejectWithValue(fetched.response.error);
    }

    if (
      !shouldReExecuteTheQueryWithCorrections(state, fetched.response.success)
    ) {
      dispatch(snapshot(extractHistory(state)));
      return {
        ...fetched,
        response: fetched.response.success,
        automaticallyCorrected: false,
        analyticsAction,
      };
    }

    const retried = await automaticallyRetryQueryWithCorrection(
      searchAPIClient,
      fetched.response.success.queryCorrections[0].correctedQuery,
      getState,
      dispatch
    );

    dispatch(snapshot(extractHistory(getState())));

    if (isErrorResponse(retried.response)) {
      return rejectWithValue(retried.response.error);
    }

    return {
      ...retried,
      response: retried.response.success,
      automaticallyCorrected: true,
      analyticsAction,
    };
  }
);

const automaticallyRetryQueryWithCorrection = async (
  client: SearchAPIClient,
  correction: string,
  getState: () => SearchPageState,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  dispatch(updateQuery({q: correction}));
  const fetched = await fetchFromAPI(client, getState());
  dispatch(logDidYouMeanAutomatic());
  dispatch(applyDidYouMeanCorrection(correction));
  return fetched;
};

const shouldReExecuteTheQueryWithCorrections = (
  state: SearchPageState,
  res: SearchResponseSuccess
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
  numericFacetSet: state.numericFacetSet,
  dateFacetSet: state.dateFacetSet,
  categoryFacetSet: state.categoryFacetSet,
  pagination: state.pagination,
  query: state.query,
  constantQuery: state.constantQuery,
  querySet: state.querySet,
  sortCriteria: state.sortCriteria,
  pipeline: state.pipeline,
  searchHub: state.searchHub,
});
