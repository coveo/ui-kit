import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createUnifiedEndpointRequestSelector} from './unified-request-selector.js';
import type {CommerceRequestModel} from './unified-endpoint-types.js';

export function createConversationRequestBuilder(
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle
) {
  const buildStateRequest = createUnifiedEndpointRequestSelector(
    generativeInterface,
    cartInterface
  );

  return function buildConversationRequest(
    engine: FullEngine,
    prompt: string
  ): CommerceRequestModel {
    const {cart, conversationSessionId, conversationToken, ...fromState} =
      engine.read(buildStateRequest);
    const navigatorContext = engine.getNavigatorContextProvider()?.();

    return {
      trackingId: fromState.trackingId,
      language: fromState.language,
      country: fromState.country,
      currency: fromState.currency,
      clientId: navigatorContext?.clientId ?? undefined,
      message: prompt,
      action: null,
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
    };
  };
}
