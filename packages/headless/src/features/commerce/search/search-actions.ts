import {CommerceSearchAction, SearchAction} from '../../analytics/analytics-utils';
import {AsyncThunkSearchOptions, isErrorResponse} from '../../../api/search/search-api-client';
import {buildSearchRequest} from '../../search/search-request';
import {AsyncSearchThunkProcessor, StateNeededByExecuteSearch} from '../../search/search-actions-thunk-processor';
import {addEntryInActionsHistory, ExecuteSearchThunkReturn} from '../../search/search-actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  buildQuerySuggestRequest,
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn, StateNeededByQuerySuggest
} from '../../query-suggest/query-suggest-actions';
import {requiredNonEmptyString} from '../../../utils/validate-payload';


export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  CommerceSearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('commerce/search/executeSearch', async (searchAction: CommerceSearchAction, config) => {
  const state = config.getState();
  addEntryInActionsHistory(state);

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await searchAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const request = await buildSearchRequest(state, eventDescription);

  // TODO(nico): Use commerce processor with commerce client
  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({...config, analyticsAction: searchAction});

  const fetched = await processor.fetchFromAPI(request, {origin: 'mainSearch'});

  return await processor.process(fetched);
});

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByQuerySuggest>
>(
  'commerce/querySuggest/fetch',

  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
    });
    const id = payload.id;
    const request = await buildQuerySuggestRequest(id, getState());
    // TODO(nico): Use commerce service client with passthrough request
    const response = await apiClient.querySuggest(request);

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      id,
      q: request.q,
      ...response.success,
    };
  }
);
