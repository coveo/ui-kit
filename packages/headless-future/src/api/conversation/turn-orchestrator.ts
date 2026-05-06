import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import * as conversationSelectors from '@/src/core/interface/conversation/conversation-selectors.js';
import type {ConversationMessage} from '@/src/core/interface/conversation/conversation-types.js';
import {getProductsFromCartState} from '@/src/core/interface/cart/cart-types.js';
import type {ConversationIdStrategy} from './id-strategy.js';

export type TurnContext = {
  turnId: string;
  userMessageId: string;
  assistantMessageId: string;
};

export type ConverseRequestBody = {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  clientId: string;
  message: string;
  context: {
    user: {
      userAgent?: string;
    };
    view: {
      url: string;
      referrer?: string;
    };
    cart: Array<{productId: string; quantity: number}>;
  };
  conversationSessionId?: string;
  conversationToken?: string;
  targetEngine: 'AGENT_CORE';
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
  fullEngine.mutate(conversationMutators.resetStreamingForTurn());

  return {turnId, userMessageId, assistantMessageId};
};

export const buildConverseRequestBody = (
  fullEngine: FullEngine,
  input: string
): ConverseRequestBody => {
  const session = fullEngine.read(conversationSelectors.session);
  const configuration =
    fullEngine.read((state) => state.configuration) ??
    ({
      trackingId: '',
      language: '',
      country: '',
      currency: '',
    } as const);
  const navigatorContext =
    fullEngine.read((state) => state.navigatorContext) ??
    ({
      clientId: '',
      userAgent: null,
      url: null,
      referrer: null,
    } as const);
  const cart = fullEngine.read((state) => state.cart);

  const contextUser: {userAgent?: string} = {};
  if (navigatorContext.userAgent) {
    contextUser.userAgent = navigatorContext.userAgent;
  }

  const contextView: {url: string; referrer?: string} = {
    url: navigatorContext.url ?? '',
  };
  if (navigatorContext.referrer) {
    contextView.referrer = navigatorContext.referrer;
  }

  return {
    trackingId: configuration.trackingId,
    language: configuration.language,
    country: configuration.country,
    currency: configuration.currency,
    clientId: navigatorContext.clientId,
    message: input,
    context: {
      user: contextUser,
      view: contextView,
      cart: cart ? getProductsFromCartState(cart) : [],
    },
    conversationSessionId: session?.conversationSessionId || undefined,
    conversationToken: session?.conversationToken || undefined,
    targetEngine: 'AGENT_CORE',
  };
};
