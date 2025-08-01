import {
  hasExpired,
  type InstantItemsCache,
  type InstantItemsState,
} from './instant-items-state.js';

type InstantItemsStateWithCache = InstantItemsState<
  Record<string, InstantItemsCache & {error: unknown}>
>;

export const registerInstantItem = (
  payload: {id: string},
  state: InstantItemsStateWithCache
) => {
  const {id} = payload;
  if (state[id]) {
    return;
  }
  state[id] = {q: '', cache: {}};
  return state;
};

export const updateInstantItemQuery = (
  payload: {q: string; id: string},
  state: InstantItemsStateWithCache
) => {
  const {q, id} = payload;
  if (!q) {
    return;
  }
  state[id].q = q;
};

export const clearExpiredItems = (
  payload: {id: string},
  state: InstantItemsStateWithCache
) => {
  const {id} = payload;
  Object.entries(state[id].cache).forEach(([q, cached]) => {
    if (hasExpired(cached)) {
      delete state[id].cache[q];
    }
  });
};

export const fetchItemsPending = (
  payload: {id: string; q: string},
  state: InstantItemsStateWithCache,
  toSetEmptyIfNotFound: Record<string, unknown>
) => {
  for (const id in state) {
    for (const query in state[id].cache) {
      state[id].cache[query].isActive = false;
    }
  }

  if (!getCached(payload, state)) {
    makeEmptyCache(payload, state, toSetEmptyIfNotFound);
    return;
  }

  const cached = getCached(payload, state);
  cached!.isLoading = true;
  cached!.isActive = true;
  cached!.error = null;
};

export const fetchItemsFulfilled = (
  payload: {
    id: string;
    q: string;
    searchUid: string;
    cacheTimeout?: number;
    totalCountFiltered: number;
    duration: number;
  },
  state: InstantItemsStateWithCache,
  toAddToCache: Record<string, unknown>
) => {
  const {id, q, searchUid, cacheTimeout, totalCountFiltered, duration} =
    payload;
  state[id].cache[q] = {
    ...getCached(payload, state),
    ...toAddToCache,
    isActive: true,
    searchUid,
    isLoading: false,
    error: null,
    expiresAt: cacheTimeout ? cacheTimeout + Date.now() : 0,
    totalCountFiltered,
    duration,
  };
};

export const fetchItemsRejected = (
  payload: {id: string; q: string; error?: unknown},
  state: InstantItemsStateWithCache
) => {
  const {id, q, error} = payload;

  state[id].cache[q].error = error || null;
  state[id].cache[q].isLoading = false;
  state[id].cache[q].isActive = false;
};

const getCached = (
  payload: {id: string; q: string},
  state: InstantItemsStateWithCache
): (InstantItemsCache & {error: unknown}) | null => {
  const {q, id} = payload;
  return state[id].cache[q] || null;
};

const makeEmptyCache = (
  payload: {id: string; q: string},
  state: InstantItemsStateWithCache,
  setToEmpty: Record<string, unknown>
) => {
  const {q, id} = payload;
  state[id].cache[q] = {
    isLoading: true,
    error: null,
    expiresAt: 0,
    isActive: true,
    searchUid: '',
    totalCountFiltered: 0,
    duration: 0,
    ...setToEmpty,
  };
};
