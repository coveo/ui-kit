import {createAsyncThunk} from '@reduxjs/toolkit';
import {isErrorResponse} from '../../api/search/search-api-client.js';
import type {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client.js';
import type {
  ConfigurationSection,
  FoldingSection,
  InsightConfigurationSection,
  QuerySection,
} from '../../state/state-sections.js';
import type {LoadCollectionFulfilledReturn} from '../folding/folding-actions.js';
import type {ResultWithFolding} from '../folding/folding-slice.js';
import type {CollectionId} from '../folding/folding-state.js';
import {fetchFromAPI} from '../insight-search/insight-search-actions.js';
import {buildInsightLoadCollectionRequest} from '../insight-search/insight-search-request.js';

type StateNeededByLoadCollection = ConfigurationSection &
  FoldingSection &
  QuerySection &
  InsightConfigurationSection;

export const loadCollection = createAsyncThunk<
  LoadCollectionFulfilledReturn,
  CollectionId,
  AsyncThunkInsightOptions<StateNeededByLoadCollection>
>(
  'folding/loadCollection',
  async (
    collectionId: CollectionId,
    {getState, rejectWithValue, extra: {apiClient}}
  ) => {
    const state = getState();
    const actualRequest = await buildInsightLoadCollectionRequest(
      state,
      collectionId
    );

    const fetched = await fetchFromAPI(apiClient, state, actualRequest, {
      origin: 'foldingCollection',
    });
    const response = fetched.response;

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }
    return {
      collectionId,
      results: response.success.results,
      searchUid: response.success.searchUid,
      rootResult: state.folding.collections[collectionId]!
        .result as ResultWithFolding,
    };
  }
);
