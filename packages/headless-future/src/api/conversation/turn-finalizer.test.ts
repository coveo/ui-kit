import {describe, expect, it} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {streamingSlice} from '@/src/core/internal/streaming/streaming-slice.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import {
  finalizeTurnCompleted,
  finalizeTurnAborted,
  markTurnStreaming,
} from './turn-finalizer.js';

describe('turn-finalizer', () => {
  it('ignores invalid transition and records warning', async () => {
    const engine = createTestEngine();
    const fullEngine = getFullEngine(engine);

    await fullEngine.adoptSlice(conversationSlice);
    await fullEngine.adoptSlice(streamingSlice);

    fullEngine.mutate(
      conversationMutators.addTurn({
        id: 'turn-1',
        userMessageId: 'user-1',
        assistantMessageId: 'assistant-1',
        status: 'completed',
        createdAt: Date.now(),
      })
    );

    const transitioned = markTurnStreaming(fullEngine, 'turn-1');
    expect(transitioned).toBe(false);

    const turn = engine.read((state) => state.conversation?.turns?.[0]);
    expect(turn?.status).toBe('completed');
    expect(turn?.warningCodes).toContain('invalid_state_transition');
  });

  it('flags double finalization attempts', async () => {
    const engine = createTestEngine();
    const fullEngine = getFullEngine(engine);

    await fullEngine.adoptSlice(conversationSlice);
    await fullEngine.adoptSlice(streamingSlice);

    fullEngine.mutate(
      conversationMutators.addTurn({
        id: 'turn-2',
        userMessageId: 'user-2',
        assistantMessageId: 'assistant-2',
        status: 'pending',
        createdAt: Date.now(),
      })
    );

    markTurnStreaming(fullEngine, 'turn-2');
    const firstFinalize = finalizeTurnCompleted(
      fullEngine,
      'turn-2',
      'assistant-2',
      true
    );
    const secondFinalize = finalizeTurnCompleted(
      fullEngine,
      'turn-2',
      'assistant-2',
      true
    );

    expect(firstFinalize).toBe(true);
    expect(secondFinalize).toBe(false);

    const turn = engine.read((state) => state.conversation?.turns?.[0]);
    expect(turn?.warningCodes).toContain('double_finalization_attempt');
  });

  it('marks turn aborted and toggles streaming aborted marker', async () => {
    const engine = createTestEngine();
    const fullEngine = getFullEngine(engine);

    await fullEngine.adoptSlice(conversationSlice);
    await fullEngine.adoptSlice(streamingSlice);

    fullEngine.mutate(
      conversationMutators.addTurn({
        id: 'turn-3',
        userMessageId: 'user-3',
        assistantMessageId: 'assistant-3',
        status: 'streaming',
        createdAt: Date.now(),
      })
    );
    fullEngine.mutate(conversationMutators.setActiveTurnId('turn-3'));

    const finalized = finalizeTurnAborted(fullEngine, 'turn-3', 'stop');

    expect(finalized).toBe(true);
    expect(engine.read((state) => state.streaming?.aborted)).toBe(true);

    const turn = engine.read((state) => state.conversation?.turns?.[0]);
    expect(turn?.status).toBe('aborted');
    expect(turn?.reason).toBe('stop');
  });
});
