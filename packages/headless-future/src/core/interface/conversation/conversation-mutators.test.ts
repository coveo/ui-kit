import {describe, expect, it} from 'vitest';
import {
  abortTurn,
  appendAgentChunk,
  completeTurn,
  failTurn,
  patchSession,
  setError,
  setSession,
  setStreamingConnected,
  startTurn,
} from './conversation-mutators.js';

const TEST_ID = 'test';

describe('conversation mutators', () => {
  describe('mutation shape', () => {
    it('startTurn returns expected mutation', () => {
      expect(
        startTurn(
          {
            turnId: 'turn-1',
            userMessageId: 'msg-user-1',
            agentMessageId: 'msg-agent-1',
            input: 'Hello',
            createdAt: 100,
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/startTurn`,
        payload: {
          turnId: 'turn-1',
          userMessageId: 'msg-user-1',
          agentMessageId: 'msg-agent-1',
          input: 'Hello',
          createdAt: 100,
        },
      });
    });

    it('appendAgentChunk returns expected mutation', () => {
      expect(
        appendAgentChunk(
          {
            turnId: 'turn-1',
            chunk: 'World',
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/appendAgentChunk`,
        payload: {
          turnId: 'turn-1',
          chunk: 'World',
        },
      });
    });

    it('completeTurn returns expected mutation', () => {
      expect(
        completeTurn(
          {
            turnId: 'turn-1',
            finalizedAt: 200,
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/completeTurn`,
        payload: {
          turnId: 'turn-1',
          finalizedAt: 200,
        },
      });
    });

    it('failTurn returns expected mutation', () => {
      expect(
        failTurn(
          {
            turnId: 'turn-1',
            reason: 'protocol_error',
            finalizedAt: 220,
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/failTurn`,
        payload: {
          turnId: 'turn-1',
          reason: 'protocol_error',
          finalizedAt: 220,
        },
      });
    });

    it('abortTurn returns expected mutation', () => {
      expect(
        abortTurn(
          {
            turnId: 'turn-1',
            finalizedAt: 240,
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/abortTurn`,
        payload: {
          turnId: 'turn-1',
          finalizedAt: 240,
        },
      });
    });

    it('setSession returns expected mutation', () => {
      expect(
        setSession(
          {
            conversationSessionId: 'session-1',
            conversationToken: 'token-1',
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/setSession`,
        payload: {
          conversationSessionId: 'session-1',
          conversationToken: 'token-1',
        },
      });
    });

    it('patchSession returns expected mutation', () => {
      expect(
        patchSession(
          {
            conversationToken: 'token-2',
          },
          TEST_ID
        )
      ).toEqual({
        type: `${TEST_ID}/conversation/patchSession`,
        payload: {
          conversationToken: 'token-2',
        },
      });
    });

    it('setError returns expected mutation', () => {
      expect(setError('boom', TEST_ID)).toEqual({
        type: `${TEST_ID}/conversation/setError`,
        payload: 'boom',
      });
      expect(setError(null, TEST_ID)).toEqual({
        type: `${TEST_ID}/conversation/setError`,
        payload: null,
      });
    });

    it('setStreamingConnected returns expected mutation', () => {
      expect(setStreamingConnected(true, TEST_ID)).toEqual({
        type: `${TEST_ID}/conversation/setStreamingConnected`,
        payload: true,
      });
      expect(setStreamingConnected(false, TEST_ID)).toEqual({
        type: `${TEST_ID}/conversation/setStreamingConnected`,
        payload: false,
      });
    });
  });
});
