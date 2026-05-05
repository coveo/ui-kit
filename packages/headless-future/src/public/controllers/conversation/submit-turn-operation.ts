/**
 * Submit turn operation: owns the complete submit flow including
 * guard checks, turn initialization, stream execution, finalization,
 * error handling, and checkpoint management.
 */

import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import {executeConverseStream} from '@/src/api/conversation/execute-converse-stream.js';
import type {TransportAdapter} from '@/src/api/adapters/types.js';
import {initializeTurn, buildConverseRequestBody} from './turn-orchestrator.js';
import {dispatchStreamEvent} from './event-dispatcher.js';
import {finalizeFromStreamOutcome} from './stream-outcome-finalizer.js';
import {finalizeTurnFailed, markTurnStreaming} from './turn-finalizer.js';
import type {ConversationIdStrategy} from './id-strategy.js';
import type {ConversationLifecycleHooks} from './controller.js';

type SubmitTurnOperationParams = {
  fullEngine: FullEngine;
  transport: TransportAdapter;
  idStrategy: ConversationIdStrategy;
  saveCheckpoint: () => Promise<void>;
  hooks?: ConversationLifecycleHooks;
};

export const createSubmitTurnOperation = ({
  fullEngine,
  transport,
  idStrategy,
  saveCheckpoint,
  hooks,
}: SubmitTurnOperationParams) => {
  let activeAbortController: AbortController | null = null;

  const submitTurn = async (
    input: string,
    options?: {metadata?: Record<string, unknown>}
  ): Promise<void> => {
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
        transport,
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
  };

  const getAbortController = (): AbortController | null =>
    activeAbortController;

  return {
    submitTurn,
    getAbortController,
  };
};

export type SubmitTurnOperation = ReturnType<typeof createSubmitTurnOperation>;
