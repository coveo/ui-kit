import {describe, expect, it} from 'vitest';
import type {ConversationEndpointState} from './conversation-endpoint-types.js';
import {
  configuration,
  error,
  isLoading,
  status,
  streaming,
} from './conversation-endpoint-selectors.js';

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
    const state = {conversationEndpoint: idleState};

    expect(status(state)).toBe('idle');
    expect(isLoading(state)).toBe(false);
    expect(error(state)).toBeNull();
    expect(configuration(state)).toEqual({});
    expect(streaming(state)).toEqual({isConnected: false});
  });

  it('should read pending/streaming state correctly', () => {
    const state = {conversationEndpoint: pendingState};

    expect(status(state)).toBe('pending');
    expect(isLoading(state)).toBe(true);
    expect(error(state)).toBe('boom');
    expect(configuration(state)).toEqual({language: 'en'});
    expect(streaming(state)).toEqual({isConnected: true});
  });
});
