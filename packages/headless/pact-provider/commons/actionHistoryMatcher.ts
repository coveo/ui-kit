import {MatchersV3} from '@pact-foundation/pact';
import {iso8601Matcher} from './timeMatchers.js';

const actionHistoryQueryMatcher = {
  name: 'Query',
  time: iso8601Matcher,
  value: MatchersV3.string(),
};

const actionHistoryPageViewMatcher = {
  name: 'PageView',
  time: iso8601Matcher,
  value: MatchersV3.string(),
};

export const actionsHistoryMatchers = MatchersV3.eachLike(
  [actionHistoryQueryMatcher, actionHistoryPageViewMatcher],
  0
);
