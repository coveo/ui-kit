import {MatchersV3} from '@pact-foundation/pact';

export const iso8601Matcher = MatchersV3.timestamp(
  "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  '2021-01-01T00:00:00.000Z'
);
