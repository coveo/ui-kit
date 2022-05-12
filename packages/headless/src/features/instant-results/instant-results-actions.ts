import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {InstantResultSection} from '../../state/state-sections';
import {
  validatePayload,
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';
import {StateNeededByExecuteSearch} from '../search/search-actions';
import {mapSearchRequest, mapSearchResponse} from '../search/search-mappings';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {logQueryError} from '../search/search-analytics-actions';
import {Result} from '../../case-assist.index';

export interface RegisterInstantResultActionCreatorPayload {
  /**
   * The search box id.
   */
  id: string;
}

export interface UpdateInstantResultQueryActionCreatorPayload {
  /**
   * The search box id.
   */
  id: string;
  /**
   * The initial basic query expression for instant results.
   */
  q: string;
}

const instantResultsRegisterDefinition = {
  id: requiredNonEmptyString,
};

const instantResultsQueryDefinition = {
  ...instantResultsRegisterDefinition,
  q: requiredEmptyAllowedString,
};

export const registerInstantResults = createAction(
  'instantResults/register',
  (payload: RegisterInstantResultActionCreatorPayload) =>
    validatePayload(payload, instantResultsRegisterDefinition)
);

export const updateInstantResultsQuery = createAction(
  'instantResults/updateQuery',
  (payload: UpdateInstantResultQueryActionCreatorPayload) =>
    validatePayload(payload, instantResultsQueryDefinition)
);

export interface FetchInstantResultsActionCreatorPayload {
  /**
   * The search box id.
   */
  id: string;
  /**
   * The query for which instant results are retrieved.
   */
  q: string;
}

export interface FetchInstantResultsThunkReturn {
  results: Result[];
}

export type StateNeededByInstantResults = StateNeededByExecuteSearch &
  InstantResultSection;

export const fetchInstantResults = createAsyncThunk<
  FetchInstantResultsThunkReturn,
  FetchInstantResultsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByInstantResults>
>(
  'instantResults/fetch',
  async (
    payload: FetchInstantResultsActionCreatorPayload,
    {getState, dispatch, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
      q: requiredNonEmptyString,
    });
    const q = payload.q;
    const state = getState();

    const {request, mappings} = await buildInstantResultSearchRequest(state, q);
    const response = await mapSearchResponse(
      await apiClient.search(request),
      mappings
    );

    if (isErrorResponse(response)) {
      dispatch(logQueryError(response.error));
      return rejectWithValue(response.error);
    }
    return {results: response.success.results};
  }
);

export const buildInstantResultSearchRequest = async (
  state: StateNeededByExecuteSearch,
  q: string
) => {
  const sharedWithFoldingRequest =
    await buildSearchAndFoldingLoadCollectionRequest(state);

  return mapSearchRequest({
    ...sharedWithFoldingRequest,
    q,
  });
};
