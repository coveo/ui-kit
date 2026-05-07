import {describe, expect, it} from 'vitest';
import * as mutators from './conversation-mutators.js';

describe('conversation mutators', () => {
  describe('mutation shape', () => {
    it('startTurn returns expected mutation', () => {
      expect(
        mutators.startTurn({
          turnId: 'turn-1',
          userMessageId: 'msg-user-1',
          agentMessageId: 'msg-agent-1',
          input: 'Hello',
          createdAt: 100,
        })
      ).toEqual({
        type: 'conversation/startTurn',
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
        mutators.appendAgentChunk({
          turnId: 'turn-1',
          chunk: 'World',
        })
      ).toEqual({
        type: 'conversation/appendAgentChunk',
        payload: {
          turnId: 'turn-1',
          chunk: 'World',
        },
      });
    });

    it('completeTurn returns expected mutation', () => {
      expect(
        mutators.completeTurn({
          turnId: 'turn-1',
          finalizedAt: 200,
        })
      ).toEqual({
        type: 'conversation/completeTurn',
        payload: {
          turnId: 'turn-1',
          finalizedAt: 200,
        },
      });
    });

    it('failTurn returns expected mutation', () => {
      expect(
        mutators.failTurn({
          turnId: 'turn-1',
          reason: 'protocol_error',
          finalizedAt: 220,
        })
      ).toEqual({
        type: 'conversation/failTurn',
        payload: {
          turnId: 'turn-1',
          reason: 'protocol_error',
          finalizedAt: 220,
        },
      });
    });

    it('abortTurn returns expected mutation', () => {
      expect(
        mutators.abortTurn({
          turnId: 'turn-1',
          finalizedAt: 240,
        })
      ).toEqual({
        type: 'conversation/abortTurn',
        payload: {
          turnId: 'turn-1',
          finalizedAt: 240,
        },
      });
    });

    it('setSession returns expected mutation', () => {
      expect(
        mutators.setSession({
          conversationSessionId: 'session-1',
          conversationToken: 'token-1',
        })
      ).toEqual({
        type: 'conversation/setSession',
        payload: {
          conversationSessionId: 'session-1',
          conversationToken: 'token-1',
        },
      });
    });

    it('setError returns expected mutation', () => {
      expect(mutators.setError('boom')).toEqual({
        type: 'conversation/setError',
        payload: 'boom',
      });
      expect(mutators.setError(null)).toEqual({
        type: 'conversation/setError',
        payload: null,
      });
    });

    it('setStreamingConnected returns expected mutation', () => {
      expect(mutators.setStreamingConnected(true)).toEqual({
        type: 'conversation/setStreamingConnected',
        payload: true,
      });
      expect(mutators.setStreamingConnected(false)).toEqual({
        type: 'conversation/setStreamingConnected',
        payload: false,
      });
    });
  });
});
