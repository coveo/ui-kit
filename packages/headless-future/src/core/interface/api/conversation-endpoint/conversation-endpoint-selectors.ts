import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {initialConversationEndpointState} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {State} from '@/src/core/interface/engine/engine-types.js';

const getConversationEndpointState = (state: State) =>
  state.conversationEndpoint ?? initialConversationEndpointState;

export const status = createMemoizedStateSelector(
  getConversationEndpointState,
  (state) => state.status
);

export const isLoading = createMemoizedStateSelector(
  getConversationEndpointState,
  (state) => state.status !== 'idle'
);

export const error = createMemoizedStateSelector(
  getConversationEndpointState,
  (state) => state.error
);

export const configuration = createMemoizedStateSelector(
  getConversationEndpointState,
  (state) => state.configuration
);

export const streaming = createMemoizedStateSelector(
  getConversationEndpointState,
  (state) => state.streaming
);
