import {describe, expect, it} from 'vitest';
import * as mutators from './conversation-endpoint-mutators.js';

describe('conversation endpoint mutators', () => {
  it('setStatus returns expected mutation', () => {
    expect(mutators.setStatus('streaming')).toEqual({
      type: 'conversationEndpoint/setStatus',
      payload: 'streaming',
    });
  });

  it('setError returns expected mutation', () => {
    expect(mutators.setError('boom')).toEqual({
      type: 'conversationEndpoint/setError',
      payload: 'boom',
    });
    expect(mutators.setError(null)).toEqual({
      type: 'conversationEndpoint/setError',
      payload: null,
    });
  });

  it('setConfiguration returns expected mutation', () => {
    expect(mutators.setConfiguration({language: 'en'})).toEqual({
      type: 'conversationEndpoint/setConfiguration',
      payload: {language: 'en'},
    });
  });

  it('setStreamingConnected returns expected mutation', () => {
    expect(mutators.setStreamingConnected(true)).toEqual({
      type: 'conversationEndpoint/setStreamingConnected',
      payload: true,
    });
  });
});
