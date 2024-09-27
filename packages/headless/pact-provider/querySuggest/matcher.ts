import {MatchersV3} from '@pact-foundation/pact';
import {actionsHistoryMatchers} from '../commons/actionHistoryMatcher.js';
import {analyticsMatcher} from '../commons/analyticsMatcher.js';

export const queryMatcherFactory = () => ({
  method: 'POST',
  path: '/querySuggest',
  query: {
    organizationId: MatchersV3.string(),
  },
  body: {
    actionsHistory: actionsHistoryMatchers,
    analytics: analyticsMatcher,
    q: '',
    count: MatchersV3.number(),
    locale: MatchersV3.string('en'),
    timezone: MatchersV3.string('America/Toronto'),
    tab: MatchersV3.string('default'),
    searchHub: MatchersV3.string('default'),
  },
});

export const responseMatcherFactory = () => ({
  status: 200,
  headers: {'Content-Type': 'application/json'},
  body: {
    completions: MatchersV3.atMostLike(
      {
        expression: MatchersV3.string('suede'),
        score: MatchersV3.decimal(1.0),
        highlighted: MatchersV3.string('[suede]'),
        executableConfidence: MatchersV3.decimal(),
        objectId: MatchersV3.uuid(),
      },
      8,
      1
    ),
    responseId: MatchersV3.uuid(),
  },
});
