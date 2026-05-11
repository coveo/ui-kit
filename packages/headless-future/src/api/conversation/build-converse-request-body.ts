import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {ConverseRequestBody} from './converse-types.js';

export function buildConverseRequestBody(
  engine: FullEngine,
  message: string
): ConverseRequestBody {
  const {country, currency, language, trackingId} =
    engine.read((state) => state.configuration) ?? {};

  const {
    clientId,
    referrer,
    location: url,
    userAgent,
  } = engine.getNavigatorContextProvider()?.() ?? {};

  const {items: cart} = engine.read((state) => state.cart) ?? {items: []};

  const {conversationSessionId, conversationToken} =
    engine.read((state) => state.conversation?.session) ?? {};

  return {
    country,
    currency,
    language,
    trackingId,
    clientId,
    context: {
      cart,
      user: {
        userAgent,
      },
      view: {
        referrer,
        url,
      },
    },
    conversationSessionId,
    conversationToken,
    message,
    targetEngine: 'AGENT_CORE',
  };
}
