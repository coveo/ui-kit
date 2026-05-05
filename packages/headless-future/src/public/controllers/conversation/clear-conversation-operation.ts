/**
 * Clear conversation operation: owns the clear flow including
 * aborting the current turn, clearing conversation/stream/surfaces state,
 * and deleting persisted state.
 */

import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import * as surfacesMutators from '@/src/core/interface/surfaces/mutate.js';
import type {PersistenceAdapter} from '@/src/api/adapters/types.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';

type ClearConversationOperationParams = {
  fullEngine: FullEngine;
  persistence: PersistenceAdapter;
};

export const createClearConversationOperation = ({
  fullEngine,
  persistence,
}: ClearConversationOperationParams) => {
  const clearConversation = (abortTurn: (reason?: string) => void): void => {
    abortTurn('clear');
    fullEngine.mutate(conversationMutators.clearConversation());
    fullEngine.mutate(streamingMutators.resetStream());
    fullEngine.mutate(surfacesMutators.clearAllSurfaces());
    void persistence.delete(CONVERSATION_PERSISTENCE_KEY);
  };

  return {
    clearConversation,
  };
};

export type ClearConversationOperation = ReturnType<
  typeof createClearConversationOperation
>;
