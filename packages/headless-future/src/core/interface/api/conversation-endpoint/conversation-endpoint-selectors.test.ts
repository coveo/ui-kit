import {describe, expect, it} from 'vitest';
import type {ConversationEndpointState} from './conversation-endpoint-types.js';
import {createConversationEndpointSelectors} from './conversation-endpoint-selectors.js';

const TEST_ID = 'test';
const selectors = createConversationEndpointSelectors(TEST_ID);

describe('conversation endpoint selectors', () => {
  const idleState: ConversationEndpointState = {
    configuration: {},
    status: 'idle',
    error: null,
    streaming: {isConnected: false},
  };

  const pendingState: ConversationEndpointState = {
    configuration: {language: 'en'},
    status: 'pending',
    error: 'boom',
    streaming: {isConnected: true},
  };

  it('should read idle state correctly', () => {
    const state = {[`${TEST_ID}/conversationEndpoint`]: idleState};

    expect(selectors.getStatus(state)).toBe('idle');
    expect(selectors.getIsLoading(state)).toBe(false);
    expect(selectors.getError(state)).toBeNull();
    expect(selectors.getStreaming(state)).toEqual({isConnected: false});
  });

  it('should read pending/streaming state correctly', () => {
    const state = {[`${TEST_ID}/conversationEndpoint`]: pendingState};

    expect(selectors.getStatus(state)).toBe('pending');
    expect(selectors.getIsLoading(state)).toBe(true);
    expect(selectors.getError(state)).toBe('boom');
    expect(selectors.getStreaming(state)).toEqual({isConnected: true});
  });
});
