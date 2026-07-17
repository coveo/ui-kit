import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import {getOrCreateCartSelectors} from '@/src/internal/features/cart/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

export function createConversationEndpointRequestSelector(
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle
) {
  const configuration = getOrCreateConfigurationSelectors();
  const generative = getOrCreateGenerativeSelectors(generativeInterface);
  const cart = getOrCreateCartSelectors(cartInterface);

  return createMemoizedStateSelector(
    configuration.getTrackingId,
    configuration.getLanguage,
    configuration.getCountry,
    configuration.getCurrency,
    generative.getActiveMessage,
    cart.getCartContext,
    generative.getConversationSessionId,
    generative.getConversationToken,
    (
      trackingId,
      language,
      country,
      currency,
      message,
      cart,
      conversationSessionId,
      conversationToken
    ) => ({
      trackingId,
      language,
      country,
      currency,
      message,
      cart,
      conversationSessionId,
      conversationToken,
    })
  );
}
