import {describe, expect, it} from 'vitest';
import type {ConversationEndpointState} from './conversation-endpoint-types.js';
import * as selectors from './conversation-endpoint-selectors.js';

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

    expect(selectors.status(state)).toBe('idle');
    expect(selectors.isLoading(state)).toBe(false);
    expect(selectors.error(state)).toBeNull();
    expect(selectors.configuration(state)).toEqual({});
    expect(selectors.streaming(state)).toEqual({isConnected: false});
  });

  it('should read pending/streaming state correctly', () => {
    const state = {conversationEndpoint: pendingState};

    expect(selectors.status(state)).toBe('pending');
    expect(selectors.isLoading(state)).toBe(true);
    expect(selectors.error(state)).toBe('boom');
    expect(selectors.configuration(state)).toEqual({language: 'en'});
    expect(selectors.streaming(state)).toEqual({isConnected: true});
  });
});
