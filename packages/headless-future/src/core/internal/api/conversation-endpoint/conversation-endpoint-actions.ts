import {createAction} from '@reduxjs/toolkit';
import type {ConversationEndpointStatus} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';

const ACTION_PREFIX = 'conversationEndpoint';

export const setStatus = createAction<ConversationEndpointStatus>(
  `${ACTION_PREFIX}/setStatus`
);

export const setError = createAction<string | null>(
  `${ACTION_PREFIX}/setError`
);

export const setConfiguration = createAction<Record<string, any>>(
  `${ACTION_PREFIX}/setConfiguration`
);

export const setStreamingConnected = createAction<boolean>(
  `${ACTION_PREFIX}/setStreamingConnected`
);
