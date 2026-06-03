import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {ContextOptions} from '../controllers/commerce/context/headless-context.js';

export function buildMockCommerceContext(
  context: Partial<ContextOptions> = {}
): ContextOptions {
  return {
    country: 'some-country',
    currency: 'some-currency' as CurrencyCodeISO4217,
    language: 'some-language',
    view: {url: 'https://example.com'},
    ...context,
  };
}
