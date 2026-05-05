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
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import * as surfacesMutators from '@/src/core/interface/surfaces/mutate.js';
import {conversationSlice} from '@/src/core/internal/conversation/slice.js';
import {streamingSlice} from '@/src/core/internal/streaming/slice.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/slice.js';
import {executeConverseStream} from '@/src/api/conversation/execute-converse-stream.js';
import type {UnifiedAdapters} from '@/src/api/adapters/types.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import {
  defaultConversationIdStrategy,
  type ConversationIdStrategy,
} from './id-strategy.js';
import {
  loadConversationCheckpoints,
  saveConversationCheckpoint,
} from './persistence-checkpoints.js';
import {initializeTurn, buildConverseRequestBody} from './turn-orchestrator.js';
import {dispatchStreamEvent} from './event-dispatcher.js';
import {finalizeFromStreamOutcome} from './stream-outcome-finalizer.js';
import {
  finalizeTurnAborted,
  finalizeTurnFailed,
  markTurnStreaming,
} from './turn-finalizer.js';

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

  let activeAbortController: AbortController | null = null;

  return {
    async submitTurn(
      input: string,
      options?: {metadata?: Record<string, unknown>}
    ): Promise<void> {
      const activeTurnId = fullEngine.read(conversationSelectors.activeTurnId);
      if (activeTurnId) {
        const message = 'A turn is already in progress';
        fullEngine.mutate(conversationMutators.setError(message));
        fullEngine.mutate(
          conversationMutators.setStructuredError({
            code: 'ACTIVE_TURN_IN_PROGRESS',
            message,
            source: 'controller',
            recoverable: true,
            timestamp: Date.now(),
            turnId: activeTurnId,
          })
        );
        return;
      }

      const turn = initializeTurn(
        fullEngine,
        input,
        idStrategy,
        options?.metadata
      );
      hooks?.turn_initialized?.(turn.turnId);

      await saveCheckpoint();

      activeAbortController = new AbortController();

      markTurnStreaming(fullEngine, turn.turnId);
      fullEngine.mutate(streamingMutators.setConnected(true));
      hooks?.stream_opened?.(turn.turnId);

      try {
        const outcome = await executeConverseStream({
          transport: adapters.transport,
          body: buildConverseRequestBody(fullEngine, input),
          signal: activeAbortController.signal,
          callbacks: {
            onNormalizedEvent: (event) => {
              void dispatchStreamEvent(
                fullEngine,
                event,
                turn.turnId,
                turn.assistantMessageId
              );
            },
            onBytesReceived: (bytes) => {
              fullEngine.mutate(streamingMutators.addBytes(bytes));
            },
            onLifecycle: (event) => {
              if (event.type === 'closed') {
                hooks?.stream_closed?.(turn.turnId);
              }
            },
          },
        });

        const finalized = finalizeFromStreamOutcome(fullEngine, outcome, {
          turnId: turn.turnId,
          assistantMessageId: turn.assistantMessageId,
        });

        if (finalized) {
          hooks?.turn_finalized?.(turn.turnId);
          await saveCheckpoint();
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unknown error during submitTurn';

        const currentTurn = fullEngine
          .read(conversationSelectors.turns)
          .find((existingTurn) => existingTurn.id === turn.turnId);

        if (currentTurn?.status !== 'aborted') {
          finalizeTurnFailed(fullEngine, turn.turnId, {
            code: 'SUBMIT_TURN_ERROR',
            message,
            source: 'controller',
            recoverable: true,
          });
          hooks?.turn_finalized?.(turn.turnId);
          await saveCheckpoint();
        }
      } finally {
        activeAbortController = null;
      }
    },

    abortTurn(reason?: string): void {
      if (activeAbortController) {
        activeAbortController.abort(reason);
        activeAbortController = null;
      }

      const turnId = fullEngine.read(conversationSelectors.activeTurnId);
      if (turnId) {
        const finalized = finalizeTurnAborted(
          fullEngine,
          turnId,
          reason ?? 'user-abort'
        );
        if (finalized) {
          hooks?.turn_finalized?.(turnId);
          void saveCheckpoint();
        }
      }

      fullEngine.mutate(streamingMutators.setConnected(false));
    },

    async retryTurn(turnId: string): Promise<void> {
      const turns = fullEngine.read(conversationSelectors.turns);
      const messages = fullEngine.read(conversationSelectors.messages);
      const turn = turns.find((existingTurn) => existingTurn.id === turnId);
      if (!turn) {
        return;
      }

      const userMessage = messages.find(
        (message) => message.id === turn.userMessageId
      );
      if (!userMessage) {
        return;
      }

      await this.submitTurn(userMessage.content, {
        metadata: {retryOf: turnId},
      });
    },

    clearConversation(): void {
      this.abortTurn('clear');
      fullEngine.mutate(conversationMutators.clearConversation());
      fullEngine.mutate(streamingMutators.resetStream());
      fullEngine.mutate(surfacesMutators.clearAllSurfaces());
      void adapters.persistence.delete(CONVERSATION_PERSISTENCE_KEY);
    },

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
