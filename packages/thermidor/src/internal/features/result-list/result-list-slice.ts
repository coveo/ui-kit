import {createSlice} from '@reduxjs/toolkit';
import type {ResultListState} from './result-list-types.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateResultsActions} from './result-list-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

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

type ResultsSlice = ReturnType<typeof createResultsSlice>;

const CACHE_KEY: CacheKey<ResultsSlice> = createCacheKey<ResultsSlice>('resultList/slice');

export function createResultsSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateResultsActions>,
  hydrateAction: ReturnType<typeof getOrCreateHydrateFromSnapshotAction>
) {
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
      builder.addCase(hydrateAction, (state, action) => {
        const payload = action.payload as Record<string, unknown> | null;
        if (!payload || !Array.isArray(payload.results)) {
          return;
        }
        state.results = payload.results.map((r: unknown) =>
          mapResult(r as Record<string, unknown>)
        );
      });
    },
  });
}

export function getOrCreateResultsSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateResultsActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    return createResultsSlice(stateId, actions, hydrateAction);
  });
}
