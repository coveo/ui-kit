import {conversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {ConversationEndpointState} from './conversation-endpoint-types.js';

type StateWithConversationEndpointSlice = {
  conversationEndpoint: ConversationEndpointState;
};

export const status = (state: StateWithConversationEndpointSlice) => {
  return conversationEndpointSlice.selectors.status(state);
};

export const isLoading = (state: StateWithConversationEndpointSlice) => {
  return state.conversationEndpoint.status !== 'idle';
};

export const error = (state: StateWithConversationEndpointSlice) => {
  return conversationEndpointSlice.selectors.error(state);
};

export const configuration = (state: StateWithConversationEndpointSlice) => {
  return conversationEndpointSlice.selectors.configuration(state);
};

export const streaming = (state: StateWithConversationEndpointSlice) => {
  return conversationEndpointSlice.selectors.streaming(state);
};
