import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle, ActionIntent} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import {getOrCreateCartSelectors} from '@/src/internal/features/cart/index.js';
import type {A2uiAction, UnifiedEndpointRequest} from './unified-endpoint-types.js';

export function createUnifiedSearchRequestBuilder(
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle,
  surfaceId: string
) {
  const configSelectors = getOrCreateConfigurationSelectors();
  const generativeSelectors = getOrCreateGenerativeSelectors(generativeInterface);
  const cartSelectors = getOrCreateCartSelectors(cartInterface);

  return function buildRequest(
    engine: FullEngine,
    actionIntent: ActionIntent
  ): UnifiedEndpointRequest {
    const action: A2uiAction = {
      surfaceId,
      name: actionIntent.name,
      sourceComponentId: 'thermidor',
      timestamp: new Date().toISOString(),
      actionId: null,
      wantResponse: false,
      context: actionIntent.context,
    };

    const conversationSessionId = engine.read(generativeSelectors.getConversationSessionId);
    const conversationToken = engine.read(generativeSelectors.getConversationToken);
    const cart = engine.read(cartSelectors.getCartContext);
    const navigatorContext = engine.getNavigatorContextProvider()?.();
    const trackingId = engine.read(configSelectors.getTrackingId);
    const language = engine.read(configSelectors.getLanguage);
    const country = engine.read(configSelectors.getCountry);
    const currency = engine.read(configSelectors.getCurrency);

    return {
      session: {
        threadId: conversationSessionId || generateId(),
        clientMessageId: generateId(),
        continuationTokens: {},
      },
      messages: [],
      requestContext: {},
      forwardedProps: {},
      agentInput: {
        trackingId,
        language,
        country,
        currency,
        clientId: navigatorContext?.clientId ?? undefined,
        message: null,
        action,
        conversationSessionId,
        conversationToken,
        context: {
          view: {
            url: navigatorContext?.location ?? null,
            referrer: navigatorContext?.referrer ?? null,
          },
          user: {userAgent: navigatorContext?.userAgent ?? null},
          cart: cart ?? [],
          source: [],
          custom: {},
        },
        pinnedProducts: [],
      },
    };
  };
}
