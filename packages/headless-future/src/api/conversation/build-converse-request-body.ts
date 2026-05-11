import type {CartItem} from '@/src/core/interface/cart/cart-types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';

type ConverseRequestBodyContext = {
  user: {
    userAgent: string;
  };
  view: {
    url: string;
    referrer: string;
  };
  cart: CartItem[];
};

export type ConverseRequestBody = {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  clientId: string;
  message: string;
  context: ConverseRequestBodyContext;
  conversationSessionId: string;
  conversationToken: string;
  targetEngine: 'AGENT_CORE';
};

export function buildConverseRequestBody(
  engine: FullEngine,
  input: string
): ConverseRequestBody {
  const configuration = engine.read((state) => state.configuration);
  const conversation = engine.read((state) => state.conversation);
  const cartItems = engine.read((state) => state.cart?.items) ?? [];

  const navigatorContext = engine.getNavigatorContextProvider()?.();

  return {
    trackingId: configuration?.trackingId ?? '',
    language: configuration?.language ?? '',
    country: configuration?.country ?? '',
    currency: configuration?.currency ?? '',
    clientId: navigatorContext?.clientId ?? '',
    message: input,
    context: {
      user: {
        userAgent: navigatorContext?.userAgent ?? '',
      },
      view: {
        url: navigatorContext?.location ?? '',
        referrer: navigatorContext?.referrer ?? '',
      },
      cart: cartItems,
    },
    conversationSessionId: conversation?.session.conversationSessionId ?? '',
    conversationToken: conversation?.session.conversationToken ?? '',
    targetEngine: 'AGENT_CORE',
  };
}
