import {describe, expect, it} from 'vitest';
import {
  setConfiguration,
  setError,
  setStatus,
  setStreamingConnected,
} from './conversation-endpoint-mutators.js';

const TEST_ID = 'test';

describe('conversation endpoint mutators', () => {
  it('setStatus returns expected mutation', () => {
    expect(setStatus('streaming', TEST_ID)).toEqual({
      type: `${TEST_ID}/conversationEndpoint/setStatus`,
      payload: 'streaming',
    });
  });

  it('setError returns expected mutation', () => {
    expect(setError('boom', TEST_ID)).toEqual({
      type: `${TEST_ID}/conversationEndpoint/setError`,
      payload: 'boom',
    });
    expect(setError(null, TEST_ID)).toEqual({
      type: `${TEST_ID}/conversationEndpoint/setError`,
      payload: null,
    });
  });

  it('setConfiguration returns expected mutation', () => {
    expect(setConfiguration({language: 'en'}, TEST_ID)).toEqual({
      type: `${TEST_ID}/conversationEndpoint/setConfiguration`,
      payload: {language: 'en'},
    });
  });

  it('setStreamingConnected returns expected mutation', () => {
    expect(setStreamingConnected(true, TEST_ID)).toEqual({
      type: `${TEST_ID}/conversationEndpoint/setStreamingConnected`,
      payload: true,
    });
  });
});
