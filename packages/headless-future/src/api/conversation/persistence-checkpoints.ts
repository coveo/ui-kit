import type {PersistenceAdapter} from '@/src/api/adapters/types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {ConversationState} from '@/src/core/interface/conversation/conversation-types.js';

function isConversationState(value: unknown): value is ConversationState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ConversationState>;
  const streaming = candidate.streaming as
    | Partial<ConversationState['streaming']>
    | undefined;
  const session = candidate.session as
    | Partial<ConversationState['session']>
    | undefined;

  return (
    Array.isArray(candidate.messages) &&
    Array.isArray(candidate.turns) &&
    typeof candidate.session === 'object' &&
    !!session &&
    typeof session.conversationSessionId === 'string' &&
    !!streaming &&
    typeof streaming === 'object' &&
    typeof streaming.isConnected === 'boolean' &&
    typeof streaming.bytesReceived === 'number' &&
    typeof streaming.eventsReceived === 'number' &&
    typeof streaming.aborted === 'boolean'
  );
}

export const loadConversationCheckpoints = async (
  fullEngine: FullEngine,
  persistence: PersistenceAdapter
): Promise<void> => {
  const persisted = await persistence.load(CONVERSATION_PERSISTENCE_KEY);

  if (isConversationState(persisted)) {
    fullEngine.mutate(conversationMutators.rehydrateConversation(persisted));
  }
};

export const saveConversationCheckpoint = async (
  fullEngine: FullEngine,
  persistence: PersistenceAdapter
): Promise<void> => {
  const conversation = fullEngine.read((state) => state.conversation);
  if (!conversation) {
    return;
  }

  await persistence.save(CONVERSATION_PERSISTENCE_KEY, conversation);
};
