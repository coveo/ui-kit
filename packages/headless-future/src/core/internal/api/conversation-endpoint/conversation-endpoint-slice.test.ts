import {describe, expect, it} from 'vitest';
import {
  conversationEndpointSlice,
  initialConversationEndpointState,
} from './conversation-endpoint-slice.js';
import * as ConversationEndpointActions from './conversation-endpoint-actions.js';

describe('conversationEndpointSlice', () => {
  it('should have the correct initial state', () => {
    expect(initialConversationEndpointState).toEqual({
      configuration: {},
      status: 'idle',
      error: null,
      streaming: {
        isConnected: false,
      },
    });
  });

  it('should set the endpoint status', () => {
    const state = conversationEndpointSlice.reducer(
      initialConversationEndpointState,
      ConversationEndpointActions.setStatus('pending')
    );

    expect(state.status).toBe('pending');
  });

  it('should set and clear endpoint error', () => {
    const withError = conversationEndpointSlice.reducer(
      initialConversationEndpointState,
      ConversationEndpointActions.setError('boom')
    );
    const cleared = conversationEndpointSlice.reducer(
      withError,
      ConversationEndpointActions.setError(null)
    );

    expect(withError.error).toBe('boom');
    expect(cleared.error).toBeNull();
  });

  it('should set endpoint configuration', () => {
    const state = conversationEndpointSlice.reducer(
      initialConversationEndpointState,
      ConversationEndpointActions.setConfiguration({
        language: 'en',
        country: 'US',
      })
    );

    expect(state.configuration).toEqual({
      language: 'en',
      country: 'US',
    });
  });

  it('should set endpoint streaming connectivity', () => {
    const state = conversationEndpointSlice.reducer(
      initialConversationEndpointState,
      ConversationEndpointActions.setStreamingConnected(true)
    );

    expect(state.streaming.isConnected).toBe(true);
  });
});
