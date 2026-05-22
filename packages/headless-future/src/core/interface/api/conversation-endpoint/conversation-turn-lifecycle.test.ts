import {describe, expect, it} from 'vitest';
import {
  getFailedTurnMutations,
  getMissingTerminalMutations,
  getStreamConnectedMutations,
  getStreamStartedMutations,
  getSuccessfulTurnMutations,
} from './conversation-turn-lifecycle.js';

describe('conversation turn lifecycle', () => {
  it('marks stream connected when stream consumption starts', () => {
    expect(getStreamConnectedMutations()).toEqual([
      {
        type: 'conversationEndpoint/setStreamingConnected',
        payload: true,
      },
    ]);
  });

  it('marks endpoint as streaming on first meaningful stream event', () => {
    expect(getStreamStartedMutations()).toEqual([
      {
        type: 'conversationEndpoint/setStatus',
        payload: 'streaming',
      },
    ]);
  });

  it('builds successful terminal mutations', () => {
    expect(
      getSuccessfulTurnMutations({
        turnId: 'turn-1',
        finalizedAt: 123,
      })
    ).toEqual([
      {
        type: 'conversation/completeTurn',
        payload: {
          turnId: 'turn-1',
          finalizedAt: 123,
        },
      },
      {
        type: 'conversationEndpoint/setStatus',
        payload: 'idle',
      },
      {
        type: 'conversationEndpoint/setStreamingConnected',
        payload: false,
      },
    ]);
  });

  it('builds failed terminal mutations', () => {
    expect(
      getFailedTurnMutations({
        turnId: 'turn-2',
        finalizedAt: 999,
        reason: 'protocol_error',
        error: 'Broken payload',
      })
    ).toEqual([
      {
        type: 'conversation/failTurn',
        payload: {
          turnId: 'turn-2',
          finalizedAt: 999,
          reason: 'protocol_error',
        },
      },
      {
        type: 'conversation/setError',
        payload: 'Broken payload',
      },
      {
        type: 'conversationEndpoint/setError',
        payload: 'Broken payload',
      },
      {
        type: 'conversationEndpoint/setStatus',
        payload: 'idle',
      },
      {
        type: 'conversationEndpoint/setStreamingConnected',
        payload: false,
      },
    ]);
  });

  it('marks missing terminal stream completion as interrupted', () => {
    expect(
      getMissingTerminalMutations({
        turnId: 'turn-3',
        finalizedAt: 456,
      })
    ).toEqual([
      {
        type: 'conversation/failTurn',
        payload: {
          turnId: 'turn-3',
          finalizedAt: 456,
          reason: 'stream_interrupted',
        },
      },
      {
        type: 'conversation/setError',
        payload:
          'Conversation stream ended before a terminal event was received.',
      },
      {
        type: 'conversationEndpoint/setError',
        payload:
          'Conversation stream ended before a terminal event was received.',
      },
      {
        type: 'conversationEndpoint/setStatus',
        payload: 'idle',
      },
      {
        type: 'conversationEndpoint/setStreamingConnected',
        payload: false,
      },
    ]);
  });
});
