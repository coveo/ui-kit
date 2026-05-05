/**
 * Retry turn operation: owns the retry flow including
 * looking up the original turn and user message,
 * then delegating to submitTurn with retry metadata.
 */

import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';

type RetryTurnOperationParams = {
  fullEngine: FullEngine;
};

export const createRetryTurnOperation = ({
  fullEngine,
}: RetryTurnOperationParams) => {
  const retryTurn = async (
    turnId: string,
    submitTurn: (
      input: string,
      options?: {metadata?: Record<string, unknown>}
    ) => Promise<void>
  ): Promise<void> => {
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

    await submitTurn(userMessage.content, {
      metadata: {retryOf: turnId},
    });
  };

  return {
    retryTurn,
  };
};

export type RetryTurnOperation = ReturnType<typeof createRetryTurnOperation>;
