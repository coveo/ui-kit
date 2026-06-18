import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {getOrCreateConfigurationSelectors} from '@/src/core/internal/configuration/configuration-selectors.js';
import {getOrCreateGenerativeSelectors} from '@/src/core/internal/generative/generative-selectors.js';
import {getOrCreateCartSelectors} from '@/src/core/internal/cart/cart-selectors.js';
import type {CoveoConversationCartItem} from '@/src/api/interface/conversation-endpoint/conversation-endpoint-types.js';

export interface ConversationEndpointRequestFromState {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  message: string;
  cart: CoveoConversationCartItem[];
}

export function createConversationEndpointRequestSelector(
  generativeInterfaceId: string,
  cartInterfaceId: string
) {
  const configuration = getOrCreateConfigurationSelectors();
  const generative = getOrCreateGenerativeSelectors(generativeInterfaceId);
  const cart = getOrCreateCartSelectors(cartInterfaceId);

  return createMemoizedStateSelector(
    configuration.getTrackingId,
    configuration.getLanguage,
    configuration.getCountry,
    configuration.getCurrency,
    generative.getActiveMessage,
    cart.getItems,
    (
      trackingId,
      language,
      country,
      currency,
      message,
      cartItems
    ): ConversationEndpointRequestFromState => ({
      trackingId,
      language,
      country,
      currency,
      message,
      cart: cartItems,
    })
  );
}
