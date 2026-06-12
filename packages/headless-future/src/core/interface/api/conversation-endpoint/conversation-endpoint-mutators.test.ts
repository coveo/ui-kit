import {describe, expect, it} from 'vitest';
import {
  setConfiguration,
  setError,
  setStatus,
  setStreamingConnected,
} from './conversation-endpoint-mutators.js';

describe('conversation endpoint mutators', () => {
  it('setStatus returns expected mutation', () => {
    expect(setStatus('streaming')).toEqual({
      type: 'conversationEndpoint/setStatus',
      payload: 'streaming',
    });
  });

  it('setError returns expected mutation', () => {
    expect(setError('boom')).toEqual({
      type: 'conversationEndpoint/setError',
      payload: 'boom',
    });
    expect(setError(null)).toEqual({
      type: 'conversationEndpoint/setError',
      payload: null,
    });
  });

  it('setConfiguration returns expected mutation', () => {
    expect(setConfiguration({language: 'en'})).toEqual({
      type: 'conversationEndpoint/setConfiguration',
      payload: {language: 'en'},
    });
  });

  it('setStreamingConnected returns expected mutation', () => {
    expect(setStreamingConnected(true)).toEqual({
      type: 'conversationEndpoint/setStreamingConnected',
      payload: true,
    });
  });
});
