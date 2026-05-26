import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';

/**
 * Returns a public sample engine configuration for manual sanity checks.
 */
export function getSampleEngineConfiguration(): ConfigurationState {
  return {
    organizationId: 'searchuisamples',
    // deepcode ignore HardcodedNonCryptoSecret: Public key freely available for our documentation
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    trackingId: '',
    language: '',
    country: '',
    currency: '',
  };
}
