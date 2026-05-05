/**
 * Layer 2: ConversationController
 *
 * Thin facade over conversation turn orchestration, stream lifecycle,
 * terminal-state handling, and persistence checkpoints.
 */

import {createSelector} from '@reduxjs/toolkit';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import {conversationSlice} from '@/src/core/internal/conversation/slice.js';
import {streamingSlice} from '@/src/core/internal/streaming/slice.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/slice.js';
import type {UnifiedAdapters} from '@/src/api/adapters/types.js';
import {
  defaultConversationIdStrategy,
  type ConversationIdStrategy,
} from './id-strategy.js';
import {
  loadConversationCheckpoints,
  saveConversationCheckpoint,
} from './persistence-checkpoints.js';
import {createSubmitTurnOperation} from './submit-turn-operation.js';
import {createAbortTurnOperation} from './abort-turn-operation.js';
import {createRetryTurnOperation} from './retry-turn-operation.js';
import {createClearConversationOperation} from './clear-conversation-operation.js';

export type ConversationLifecycleHooks = {
  turn_initialized?: (turnId: string) => void;
  stream_opened?: (turnId: string) => void;
  stream_closed?: (turnId: string) => void;
  turn_finalized?: (turnId: string) => void;
};

const stateSelect = createSelector(
  [
    conversationSelectors.messages,
    conversationSelectors.activeTurn,
    conversationSelectors.session,
    conversationSelectors.isLoading,
    conversationSelectors.error,
    conversationSelectors.structuredError,
  ],
  (messages, activeTurn, session, isLoading, error, structuredError) => ({
    messages,
    activeTurn,
    session,
    isLoading,
    error,
    structuredError,
  })
);

type BuildConversationControllerOptions = {
  hooks?: ConversationLifecycleHooks;
  idStrategy?: ConversationIdStrategy;
};

export const buildConversationController = (
  engine: Engine,
  adapters: Pick<UnifiedAdapters, 'transport' | 'auth' | 'persistence'>,
  options?: BuildConversationControllerOptions
) => {
  const fullEngine = getFullEngine(engine);
  const hooks = options?.hooks;
  const idStrategy = options?.idStrategy ?? defaultConversationIdStrategy;

  fullEngine.adoptSlice(conversationSlice);
  fullEngine.adoptSlice(streamingSlice);
  fullEngine.adoptSlice(surfacesSlice);

  const saveCheckpoint = async () => {
    await saveConversationCheckpoint(fullEngine, adapters.persistence);
  };

  void loadConversationCheckpoints(fullEngine, adapters.persistence).catch(
    (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load persisted conversation state';
      fullEngine.mutate(conversationMutators.setError(message));
      fullEngine.mutate(
        conversationMutators.setStructuredError({
          code: 'PERSISTENCE_LOAD_ERROR',
          message,
          source: 'persistence',
          recoverable: true,
          timestamp: Date.now(),
        })
      );
    }
  );

  const submitOperation = createSubmitTurnOperation({
    fullEngine,
    transport: adapters.transport,
    idStrategy,
    saveCheckpoint,
    hooks,
  });

  const abortOperation = createAbortTurnOperation({
    fullEngine,
    saveCheckpoint,
    hooks,
  });

  const retryOperation = createRetryTurnOperation({
    fullEngine,
  });

  const clearOperation = createClearConversationOperation({
    fullEngine,
    persistence: adapters.persistence,
  });

  return {
    submitTurn: (
      input: string,
      options?: {metadata?: Record<string, unknown>}
    ) => submitOperation.submitTurn(input, options),

    abortTurn: (reason?: string) =>
      abortOperation.abortTurn(
        () => submitOperation.getAbortController(),
        reason
      ),

    retryTurn: (turnId: string) =>
      retryOperation.retryTurn(turnId, submitOperation.submitTurn),

    clearConversation: () =>
      clearOperation.clearConversation((reason?: string) =>
        abortOperation.abortTurn(
          () => submitOperation.getAbortController(),
          reason
        )
      ),

    get state() {
      return fullEngine.read(stateSelect);
    },

    subscribe(callback: () => void) {
      return fullEngine.subscribe(stateSelect, callback);
    },
  };
};

export type ConversationController = ReturnType<
  typeof buildConversationController
>;
