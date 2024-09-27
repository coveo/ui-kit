import {MatchersV3} from '@pact-foundation/pact';
import {iso8601Matcher} from './timeMatchers.js';

export const analyticsMatcher = {
  clientId: MatchersV3.uuid('7e1ca7a0-b049-45cd-8f25-54bbb6722ea7'),
  clientTimestamp: iso8601Matcher,
  documentReferrer: MatchersV3.string(),
  documentLocation: MatchersV3.string(),
  originContext: 'Search',
  capture: true,
  source: MatchersV3.arrayContaining(
    MatchersV3.regex(/@coveo\/headless@\d+.\d+.\d+/, '@coveo/headless@0.0.0')
  ),
};
