import type {AnyAction, Draft as WritableDraft} from '@reduxjs/toolkit';
import type {
  ClearQuerySuggestActionCreatorPayload,
  RegisterQuerySuggestActionCreatorPayload,
} from './query-suggest-actions.js';
import type {
  QuerySuggestSet,
  QuerySuggestState,
} from './query-suggest-state.js';

export function handleRegisterQuerySuggest(
  state: WritableDraft<QuerySuggestSet>,
  payload: RegisterQuerySuggestActionCreatorPayload
) {
  const id = payload.id;

  if (id in state) {
    return;
  }

  state[id] = buildQuerySuggest(payload);
}

export function handleFetchPending(
  state: WritableDraft<QuerySuggestSet>,
  action: AnyAction
) {
  const querySuggest = state[action.meta.arg.id];

  if (!querySuggest) {
    return;
  }

  querySuggest.currentRequestId = action.meta.requestId;
  querySuggest.isLoading = true;
}

export function handleFetchRejected(
  state: WritableDraft<QuerySuggestSet>,
  action: AnyAction
) {
  const querySuggest = state[action.meta.arg.id];

  if (!querySuggest) {
    return;
  }

  querySuggest.error = action.payload || null;
  querySuggest.isLoading = false;
}

export function handleClearQuerySuggest(
  state: WritableDraft<QuerySuggestSet>,
  payload: ClearQuerySuggestActionCreatorPayload
) {
  const querySuggest = state[payload.id];

  if (!querySuggest) {
    return;
  }

  querySuggest.responseId = '';
  querySuggest.completions = [];
  querySuggest.partialQueries = [];
}

function buildQuerySuggest(
  config: Partial<QuerySuggestState>
): QuerySuggestState {
  return {
    id: '',
    completions: [],
    responseId: '',
    count: 5,
    currentRequestId: '',
    error: null,
    partialQueries: [],
    isLoading: false,
    ...config,
  };
}
