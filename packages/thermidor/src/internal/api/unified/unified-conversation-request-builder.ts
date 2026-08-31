import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createUnifiedEndpointRequestSelector} from './unified-request-selector.js';
import type {A2uiAction, CommerceRequestModel} from './unified-endpoint-types.js';

export function createConversationRequestBuilder(
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle
) {
  const buildStateRequest = createUnifiedEndpointRequestSelector(
    generativeInterface,
    cartInterface
  );

  function buildBaseRequest(engine: FullEngine): Omit<CommerceRequestModel, 'message' | 'action'> {
    const {cart, conversationSessionId, conversationToken, ...fromState} =
      engine.read(buildStateRequest);
    const navigatorContext = engine.getNavigatorContextProvider()?.();

    return {
      trackingId: fromState.trackingId,
      language: fromState.language,
      country: fromState.country,
      currency: fromState.currency,
      clientId: navigatorContext?.clientId ?? undefined,
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
  }

  function buildConversationRequest(engine: FullEngine, prompt: string): CommerceRequestModel {
    return {
      ...buildBaseRequest(engine),
      message: prompt,
      action: null,
    };
  }

  function buildActionRequest(engine: FullEngine, action: A2uiAction): CommerceRequestModel {
    return {
      ...buildBaseRequest(engine),
      message: null,
      action,
    };
  }

  return {buildConversationRequest, buildActionRequest};
}
