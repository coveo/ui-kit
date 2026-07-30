import {describe, it, expect} from 'vitest';
import {
  deserializeToGenerativeState,
  type SerializedConverseState,
  type SerializedTurn,
} from './converse-controller-serialization.js';

function createSerializedTurn(overrides: Partial<SerializedTurn> = {}): SerializedTurn {
  return {
    id: 'turn-1',
    prompt: 'hello',
    status: 'complete',
    ...overrides,
  };
}

function createSerializedState(
  overrides: Partial<SerializedConverseState> = {}
): SerializedConverseState {
  return {
    name: 'test conversation',
    timestamp: 1000,
    turns: [],
    activeTurnId: undefined,
    ...overrides,
  };
}

describe('deserializeToGenerativeState', () => {
  it('maps basic fields from serialized state', () => {
    const serialized = createSerializedState({
      activeTurnId: 'turn-1',
      conversationSessionId: 'session-abc',
      conversationToken: 'token-xyz',
      turns: [createSerializedTurn()],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.activeTurnId).toBe('turn-1');
    expect(result.conversationSessionId).toBe('session-abc');
    expect(result.conversationToken).toBe('token-xyz');
    expect(result.turns).toHaveLength(1);
  });

  it('preserves turn id, prompt, and status', () => {
    const serialized = createSerializedState({
      turns: [
        createSerializedTurn({
          id: 'abc',
          prompt: 'find shoes',
          status: 'complete',
        }),
      ],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].id).toBe('abc');
    expect(result.turns[0].prompt).toBe('find shoes');
    expect(result.turns[0].status).toBe('complete');
  });

  it('marks streaming turns as error with an interruption message', () => {
    const serialized = createSerializedState({
      turns: [createSerializedTurn({status: 'streaming'})],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].status).toBe('error');
    expect(result.turns[0].error).toBe('Stream was interrupted');
  });

  it('does not modify turns that are already in error status', () => {
    const serialized = createSerializedState({
      turns: [createSerializedTurn({status: 'error', error: 'Something broke'})],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].status).toBe('error');
    expect(result.turns[0].error).toBe('Something broke');
  });

  it('does not modify complete turns', () => {
    const serialized = createSerializedState({
      turns: [createSerializedTurn({status: 'complete'})],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].status).toBe('complete');
    expect(result.turns[0].error).toBeUndefined();
  });

  it('maps routedInterface useCase into the state turn', () => {
    const serialized = createSerializedState({
      turns: [
        createSerializedTurn({
          routedInterface: {
            useCase: 'commerceSearch',
            snapshot: {results: []},
            query: undefined,
          },
        }),
      ],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].routedInterface).toEqual({
      useCase: 'commerceSearch',
    });
  });

  it('omits routedInterface when not present in the serialized turn', () => {
    const serialized = createSerializedState({
      turns: [createSerializedTurn()],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].routedInterface).toBeUndefined();
  });

  it('strips snapshot and query from routedInterface (state only holds useCase)', () => {
    const serialized = createSerializedState({
      turns: [
        createSerializedTurn({
          routedInterface: {
            useCase: 'search',
            snapshot: {results: []},
            query: 'docs',
          },
        }),
      ],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].routedInterface).toEqual({useCase: 'search'});
    expect((result.turns[0].routedInterface as any).snapshot).toBeUndefined();
    expect((result.turns[0].routedInterface as any).query).toBeUndefined();
  });

  it('preserves agentResponse data through deserialization', () => {
    const agentResponse = {
      messages: [{content: 'Here are your results', role: 'assistant'}],
      surfaces: [],
      toolCalls: [],
      reasoningContent: 'thinking...',
    };

    const serialized = createSerializedState({
      turns: [createSerializedTurn({agentResponse})],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].agentResponse).toEqual(agentResponse);
  });

  it('handles an empty turns array', () => {
    const serialized = createSerializedState({turns: []});

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns).toEqual([]);
  });

  it('handles multiple turns with mixed statuses', () => {
    const serialized = createSerializedState({
      turns: [
        createSerializedTurn({id: 't1', status: 'complete'}),
        createSerializedTurn({id: 't2', status: 'streaming'}),
        createSerializedTurn({id: 't3', status: 'error', error: 'fail'}),
      ],
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.turns[0].status).toBe('complete');
    expect(result.turns[1].status).toBe('error');
    expect(result.turns[1].error).toBe('Stream was interrupted');
    expect(result.turns[2].status).toBe('error');
    expect(result.turns[2].error).toBe('fail');
  });

  it('handles undefined conversationSessionId and conversationToken', () => {
    const serialized = createSerializedState({
      conversationSessionId: undefined,
      conversationToken: undefined,
    });

    const result = deserializeToGenerativeState(serialized);

    expect(result.conversationSessionId).toBeUndefined();
    expect(result.conversationToken).toBeUndefined();
  });
});
