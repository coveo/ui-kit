import {
  RunFinished,
  RunStarted,
  UpdateDataModelActivity,
  generateRunId,
  type ConverseEvent,
} from '../events.js';

// `fetchSuggestions` is a lookup from the `search-box` well-known surface template. The client
// creates each instance under a surface id of its choosing, so a lookup is recognized from the
// template and the template's component, never from the surface id. A lookup opens no session: its
// run carries no session keys and emits no turn_started/turn_complete.

const SEARCH_BOX_SURFACE_TEMPLATE = 'search-box';

// The `search-box` template's only node: a `QuerySuggestions` component.
const SEARCH_BOX_QUERY_SUGGESTIONS_ID = 'root';

const EXPRESSIONS = [
  'surfboards',
  'surfboard leash',
  'surfboard bag',
  'surf wax',
  'surf shorts',
  'wetsuits',
  'wetsuit gloves',
  'wetsuit boots',
  'winter wetsuit',
  'kayaks',
  'kayak paddles',
  'kayak spray skirt',
  'snorkeling gear',
  'snorkel mask',
  'snorkel fins',
  'stand up paddle boards',
  'paddle board leash',
  'life jackets',
  'life jacket for kids',
  'boating safety kit',
  'water shoes',
  'rash guards',
  'dry bags',
  'beach towels',
];

const MAX_COMPLETIONS = 6;

let lookupSequence = 0;

interface SuggestionsLookupAction {
  name: string;
  surfaceId: string;
  sourceComponentId: string;
  context: Record<string, unknown>;
}

function isSuggestionsLookup(
  surfaceTemplate: string | undefined,
  action: {name: string; surfaceId?: unknown; sourceComponentId?: unknown}
): action is SuggestionsLookupAction {
  return (
    surfaceTemplate === SEARCH_BOX_SURFACE_TEMPLATE &&
    action.sourceComponentId === SEARCH_BOX_QUERY_SUGGESTIONS_ID &&
    action.name === 'fetchSuggestions' &&
    typeof action.surfaceId === 'string'
  );
}

function completionsFor(query: string): {expression: string; score: number}[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  const prefixed = EXPRESSIONS.filter((expression) => expression.startsWith(normalized));
  const contained = EXPRESSIONS.filter(
    (expression) => !expression.startsWith(normalized) && expression.includes(normalized)
  );
  return [...prefixed, ...contained]
    .slice(0, MAX_COMPLETIONS)
    .map((expression, index) => ({expression, score: 100 - index * 5}));
}

function buildQuerySuggestionsLookupEvents(
  action: SuggestionsLookupAction,
  {conversationSessionId}: {conversationSessionId?: string} = {}
): ConverseEvent[] {
  lookupSequence += 1;
  // Like the gateway: the session's thread when there is one, otherwise a throwaway thread.
  const threadId = conversationSessionId ?? `lookup-${lookupSequence}`;
  const runId = generateRunId();
  const query = typeof action.context.query === 'string' ? action.context.query : '';

  return [
    RunStarted({threadId, runId}),
    UpdateDataModelActivity({
      messageId: `lookup-${lookupSequence}-suggestions`,
      ops: [
        {
          surfaceId: action.surfaceId,
          path: `/state/${action.sourceComponentId}`,
          value: {query, completions: completionsFor(query)},
        },
      ],
    }),
    RunFinished({threadId, runId}),
  ];
}

export {isSuggestionsLookup, buildQuerySuggestionsLookupEvents};
export type {SuggestionsLookupAction};
