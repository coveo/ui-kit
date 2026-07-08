import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import {getOrCreateCartSelectors} from '@/src/internal/features/cart/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {CoveoConversationCartItem} from '@/src/internal/api/conversation/index.js';

export interface ConversationEndpointRequestFromState {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  message: string;
  cart: CoveoConversationCartItem[];
}

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
