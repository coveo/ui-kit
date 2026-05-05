/**
 * Abort turn operation: owns the abort flow including
 * aborting the stream signal, finalizing turn state,
 * hook firing, and checkpoint management.
 */

import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import {finalizeTurnAborted} from './turn-finalizer.js';
import type {ConversationLifecycleHooks} from './controller.js';

type AbortTurnOperationParams = {
  fullEngine: FullEngine;
  saveCheckpoint: () => Promise<void>;
  hooks?: ConversationLifecycleHooks;
};

export const createAbortTurnOperation = ({
  fullEngine,
  saveCheckpoint,
  hooks,
}: AbortTurnOperationParams) => {
  const abortTurn = (
    getAbortController: () => AbortController | null,
    reason?: string
  ): void => {
    const controller = getAbortController();
    if (controller) {
      controller.abort(reason);
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
  };

  return {
    abortTurn,
  };
};

export type AbortTurnOperation = ReturnType<typeof createAbortTurnOperation>;
