import {describe, expect, it} from 'vitest';
import {
  conversationSlice,
  initialConversationState,
} from './conversation-slice.js';

describe('conversationSlice: initialState', () => {
  it('should have the correct initial state', () => {
    expect(initialConversationState).toEqual({
      messages: [],
      turns: [],
      activeTurnId: null,
      session: {},
      isLoading: false,
      error: null,
      streaming: {
        isConnected: false,
      },
    });
  });
});

describe('conversationSlice: turn lifecycle', () => {
  const basePayload = {
    turnId: 'turn-1',
    userMessageId: 'msg-user-1',
    agentMessageId: 'msg-agent-1',
    input: 'Hello there',
    createdAt: 100,
  };

  it('should start a turn with user and placeholder agent messages', () => {
    const state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.startTurn(basePayload)
    );

    expect(state.messages).toEqual([
      {
        id: 'msg-user-1',
        role: 'user',
        content: 'Hello there',
        createdAt: 100,
      },
      {
        id: 'msg-agent-1',
        role: 'agent',
        content: '',
        createdAt: 100,
      },
    ]);
    expect(state.turns).toEqual([
      {
        id: 'turn-1',
        messageIds: ['msg-user-1', 'msg-agent-1'],
        status: {type: 'pending'},
        createdAt: 100,
      },
    ]);
    expect(state.activeTurnId).toBe('turn-1');
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.streaming.isConnected).toBe(false);
  });

  it('should append streamed content and mark the turn as streaming', () => {
    const startedState = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.startTurn(basePayload)
    );

    const state = conversationSlice.reducer(
      startedState,
      conversationSlice.actions.appendAgentChunk({
        turnId: 'turn-1',
        chunk: 'General Kenobi',
      })
    );

    expect(state.messages[1].content).toBe('General Kenobi');
    expect(state.turns[0].status).toEqual({type: 'streaming'});
    expect(state.streaming.isConnected).toBe(true);
  });

  it('should ignore appended chunks for unknown turns', () => {
    const state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.appendAgentChunk({
        turnId: 'missing-turn',
        chunk: 'ignored',
      })
    );

    expect(state).toEqual(initialConversationState);
  });

  it('should complete a turn and clear terminal flags', () => {
    const streamingState = conversationSlice.reducer(
      conversationSlice.reducer(
        initialConversationState,
        conversationSlice.actions.startTurn(basePayload)
      ),
      conversationSlice.actions.appendAgentChunk({
        turnId: 'turn-1',
        chunk: 'Partial answer',
      })
    );

    const state = conversationSlice.reducer(
      streamingState,
      conversationSlice.actions.completeTurn({
        turnId: 'turn-1',
        finalizedAt: 150,
      })
    );

    expect(state.turns[0]).toMatchObject({
      status: {type: 'completed'},
      finalizedAt: 150,
    });
    expect(state.activeTurnId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.streaming.isConnected).toBe(false);
  });

  it('should fail a turn and clear terminal flags', () => {
    const startedState = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.startTurn(basePayload)
    );

    const state = conversationSlice.reducer(
      startedState,
      conversationSlice.actions.failTurn({
        turnId: 'turn-1',
        reason: 'network_error',
        finalizedAt: 175,
      })
    );

    expect(state.turns[0]).toMatchObject({
      status: {type: 'failed', reason: 'network_error'},
      finalizedAt: 175,
    });
    expect(state.activeTurnId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.streaming.isConnected).toBe(false);
  });

  it('should abort a turn and remove the empty placeholder agent message', () => {
    const startedState = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.startTurn(basePayload)
    );

    const state = conversationSlice.reducer(
      startedState,
      conversationSlice.actions.abortTurn({
        turnId: 'turn-1',
        finalizedAt: 200,
      })
    );

    expect(state.messages).toEqual([
      {
        id: 'msg-user-1',
        role: 'user',
        content: 'Hello there',
        createdAt: 100,
      },
    ]);
    expect(state.turns[0]).toMatchObject({
      messageIds: ['msg-user-1'],
      status: {type: 'aborted', reason: 'user_aborted'},
      finalizedAt: 200,
    });
    expect(state.activeTurnId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.streaming.isConnected).toBe(false);
  });

  it('should no-op terminal actions for unknown turns', () => {
    const state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.completeTurn({
        turnId: 'missing-turn',
        finalizedAt: 500,
      })
    );

    expect(state).toEqual(initialConversationState);
  });

  it('should no-op failTurn for unknown turns', () => {
    const state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.failTurn({
        turnId: 'missing-turn',
        reason: 'network_error',
        finalizedAt: 500,
      })
    );

    expect(state).toEqual(initialConversationState);
  });

  it('should no-op abortTurn for unknown turns', () => {
    const state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.abortTurn({
        turnId: 'missing-turn',
        finalizedAt: 500,
      })
    );

    expect(state).toEqual(initialConversationState);
  });

  it('should fail a turn after streaming started and preserve content', () => {
    const streamingState = conversationSlice.reducer(
      conversationSlice.reducer(
        initialConversationState,
        conversationSlice.actions.startTurn(basePayload)
      ),
      conversationSlice.actions.appendAgentChunk({
        turnId: 'turn-1',
        chunk: 'Streamed content',
      })
    );

    const state = conversationSlice.reducer(
      streamingState,
      conversationSlice.actions.failTurn({
        turnId: 'turn-1',
        reason: 'stream_interrupted',
        finalizedAt: 175,
      })
    );

    expect(state.messages[1].content).toBe('Streamed content');
    expect(state.turns[0]).toMatchObject({
      status: {type: 'failed', reason: 'stream_interrupted'},
      finalizedAt: 175,
    });
    expect(state.activeTurnId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.streaming.isConnected).toBe(false);
  });

  it('should accumulate multiple turns independently', () => {
    const turn1Payload = {
      turnId: 'turn-1',
      userMessageId: 'msg-user-1',
      agentMessageId: 'msg-agent-1',
      input: 'First question',
      createdAt: 100,
    };

    const turn2Payload = {
      turnId: 'turn-2',
      userMessageId: 'msg-user-2',
      agentMessageId: 'msg-agent-2',
      input: 'Second question',
      createdAt: 200,
    };

    // Start and complete first turn
    let state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.startTurn(turn1Payload)
    );
    state = conversationSlice.reducer(
      state,
      conversationSlice.actions.completeTurn({
        turnId: 'turn-1',
        finalizedAt: 150,
      })
    );

    // Start second turn
    state = conversationSlice.reducer(
      state,
      conversationSlice.actions.startTurn(turn2Payload)
    );

    // Verify both turns accumulated
    expect(state.turns).toHaveLength(2);
    expect(state.messages).toHaveLength(4);
    expect(state.turns[0].status).toEqual({type: 'completed'});
    expect(state.turns[1].status).toEqual({type: 'pending'});

    // Verify second turn is active
    expect(state.activeTurnId).toBe('turn-2');
    expect(state.isLoading).toBe(true);

    // Verify messages belong to correct turns
    expect(state.turns[0].messageIds).toEqual(['msg-user-1', 'msg-agent-1']);
    expect(state.turns[1].messageIds).toEqual(['msg-user-2', 'msg-agent-2']);
  });
});

describe('conversationSlice: session and error', () => {
  it('should replace the session object', () => {
    const state = conversationSlice.reducer(
      {
        ...initialConversationState,
        session: {
          conversationSessionId: 'session-1',
          conversationToken: 'token-1',
        },
      },
      conversationSlice.actions.setSession({conversationSessionId: 'session-2'})
    );

    expect(state.session).toEqual({conversationSessionId: 'session-2'});
  });

  it('should set and clear the error message', () => {
    const withError = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.setError('Request failed')
    );
    const cleared = conversationSlice.reducer(
      withError,
      conversationSlice.actions.setError(null)
    );

    expect(withError.error).toBe('Request failed');
    expect(cleared.error).toBeNull();
  });

  it('should clear the previous error when starting a new turn', () => {
    const state = conversationSlice.reducer(
      {
        ...initialConversationState,
        error: 'Previous failure',
      },
      conversationSlice.actions.startTurn({
        turnId: 'turn-2',
        userMessageId: 'msg-user-2',
        agentMessageId: 'msg-agent-2',
        input: 'Retry',
        createdAt: 250,
      })
    );

    expect(state.error).toBeNull();
  });

  it('should set streaming connectivity explicitly', () => {
    const state = conversationSlice.reducer(
      initialConversationState,
      conversationSlice.actions.setStreamingConnected(true)
    );

    expect(state.streaming.isConnected).toBe(true);
  });
});
