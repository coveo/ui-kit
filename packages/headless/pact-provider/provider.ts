import {PactV3} from '@pact-foundation/pact';
import {resolve} from 'node:path';
import {
  queryMatcherFactory,
  responseMatcherFactory,
} from './querySuggest/matcher.js';

// Create a 'pact' between the two applications in the integration we are testing
export const providerFactory = () =>
  new PactV3({
    dir: resolve(import.meta.dirname, 'pacts'),
    consumer: 'Headless',
    provider: 'SearchUI',
  });

export const addSuggestionInteraction = (provider: PactV3) =>
  provider
    .given('There are suggestions')
    .uponReceiving('a request for query suggestions')
    .withRequest(queryMatcherFactory())
    .willRespondWith(responseMatcherFactory());
