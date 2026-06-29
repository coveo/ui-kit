import {createSlice} from '@reduxjs/toolkit';
import type {ResultListState} from '@/src/core/interface/result-list/result-list-types.js';
import {getOrCreateResultsActions} from './result-list-actions.js';

export const initialResultListState: ResultListState = {
  results: [],
};

function mapResult(result: Record<string, unknown>) {
  return {
    uniqueId: result.uniqueId as string,
    title: result.title as string,
    uri: result.uri as string,
    excerpt: result.excerpt as string | undefined,
    printableUri: result.printableUri as string,
    clickUri: result.clickUri as string,
    raw: (result.raw as Record<string, unknown>) ?? {},
    score: (result.score as number) ?? 0,
  };
}

export function createResultsSlice(interfaceId: string) {
  const actions = getOrCreateResultsActions(interfaceId);

  return createSlice({
    name: `${interfaceId}/results`,
    initialState: initialResultListState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setResultsFromResponse, (state, action) => {
        state.results = action.payload.map((result) => ({
          uniqueId: result.uniqueId,
          title: result.title,
          uri: result.uri,
          excerpt: result.excerpt,
          printableUri: result.printableUri,
          clickUri: result.clickUri,
          raw: result.raw,
          score: result.score,
        }));
      });
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createResultsSlice>>();
export function getOrCreateResultsSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createResultsSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
