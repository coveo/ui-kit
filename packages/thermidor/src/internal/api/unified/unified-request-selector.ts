import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

export function createUnifiedEndpointRequestSelector(generativeInterface: InterfaceHandle) {
  const configuration = getOrCreateConfigurationSelectors();
  const generative = getOrCreateGenerativeSelectors(generativeInterface);

  return createMemoizedStateSelector(
    configuration.getTrackingId,
    configuration.getLanguage,
    configuration.getCountry,
    configuration.getCurrency,
    generative.getConversationSessionId,
    generative.getConversationToken,
    (trackingId, language, country, currency, conversationSessionId, conversationToken) => ({
      trackingId,
      language,
      country,
      currency,
      conversationSessionId,
      conversationToken,
    })
  );
}
