import type {PersistenceAdapter} from '@/src/api/adapters/types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import * as streamingSelectors from '@/src/core/interface/streaming/selectors.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {ConversationState} from '@/src/core/interface/conversation/types.js';

type PersistedConversationEnvelope = {
  conversation: ConversationState;
  streaming: {
    aborted: boolean;
    lastEventAt?: number;
  };
};

function isLegacyConversationState(value: unknown): value is ConversationState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ConversationState>;
  return Array.isArray(candidate.messages) && Array.isArray(candidate.turns);
}

function isPersistedEnvelope(
  value: unknown
): value is PersistedConversationEnvelope {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedConversationEnvelope>;
  return (
    candidate.conversation !== undefined &&
    candidate.streaming !== undefined &&
    isLegacyConversationState(candidate.conversation)
  );
}

export const loadConversationCheckpoints = async (
  fullEngine: FullEngine,
  persistence: PersistenceAdapter
): Promise<void> => {
  const persisted = await persistence.load(CONVERSATION_PERSISTENCE_KEY);
  if (!persisted) {
    return;
  }

  if (isPersistedEnvelope(persisted)) {
    fullEngine.mutate(
      conversationMutators.rehydrateConversation(persisted.conversation)
    );
    fullEngine.mutate(
      streamingMutators.rehydrateStreamingMarkers({
        aborted: persisted.streaming.aborted,
        lastEventAt: persisted.streaming.lastEventAt,
      })
    );
    return;
  }

  if (isLegacyConversationState(persisted)) {
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

  const envelope: PersistedConversationEnvelope = {
    conversation,
    streaming: {
      aborted: fullEngine.read(streamingSelectors.aborted),
      lastEventAt: fullEngine.read(streamingSelectors.lastEventAt),
    },
  };

  await persistence.save(CONVERSATION_PERSISTENCE_KEY, envelope);
};
