import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import type {ConversationMessage} from '@/src/core/interface/conversation/types.js';
import type {ConversationIdStrategy} from './id-strategy.js';

export type TurnContext = {
  turnId: string;
  userMessageId: string;
  assistantMessageId: string;
};

export type ConverseRequestBody = {
  query: string;
  sessionId?: string;
  conversationToken?: string;
  messages: Array<{role: 'user' | 'assistant'; content: string}>;
};

export const initializeTurn = (
  fullEngine: FullEngine,
  input: string,
  idStrategy: ConversationIdStrategy,
  metadata?: Record<string, unknown>
): TurnContext => {
  const turnId = idStrategy.newTurnId();
  const userMessageId = idStrategy.newMessageId();
  const assistantMessageId = idStrategy.newMessageId();
  const now = Date.now();

  const userMessage: ConversationMessage = {
    id: userMessageId,
    role: 'user',
    content: input,
    createdAt: now,
    metadata: {turnId, ...metadata},
  };

  const assistantMessage: ConversationMessage = {
    id: assistantMessageId,
    role: 'assistant',
    content: '',
    createdAt: now,
    metadata: {turnId},
  };

  fullEngine.mutate(conversationMutators.addMessage(userMessage));
  fullEngine.mutate(conversationMutators.addMessage(assistantMessage));
  fullEngine.mutate(
    conversationMutators.addTurn({
      id: turnId,
      userMessageId,
      assistantMessageId,
      status: 'pending',
      createdAt: now,
    })
  );
  fullEngine.mutate(conversationMutators.setActiveTurnId(turnId));
  fullEngine.mutate(conversationMutators.setLoading(true));
  fullEngine.mutate(conversationMutators.setError(null));
  fullEngine.mutate(conversationMutators.setStructuredError(null));
  fullEngine.mutate(streamingMutators.resetStream());

  return {turnId, userMessageId, assistantMessageId};
};

export const buildConverseRequestBody = (
  fullEngine: FullEngine,
  input: string
): ConverseRequestBody => {
  const session = fullEngine.read(conversationSelectors.session);
  const messages = fullEngine.read(conversationSelectors.messages);
  const isConverseMessage = (
    message: ConversationMessage
  ): message is ConversationMessage & {role: 'user' | 'assistant'} =>
    message.role !== 'system';

  return {
    query: input,
    sessionId: session?.sessionId || undefined,
    conversationToken: session?.conversationToken || undefined,
    messages: messages
      .filter(isConverseMessage)
      .map((message) => ({role: message.role, content: message.content})),
  };
};
