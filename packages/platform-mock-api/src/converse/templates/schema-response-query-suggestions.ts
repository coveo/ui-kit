import {RunFinished, RunStarted, UpdateDataModelActivity, type ConverseEvent} from '../events.js';

// PROTOTYPE (KIT-6367): `fetchSuggestions` as a lookup. It answers with or without a session, opens
// none, and writes only the source component's state, so it emits no turn_started/turn_complete
// (which carry session keys) and runs on a throwaway thread.

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

function completionsFor(query: string): {expression: string}[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  const prefixed = EXPRESSIONS.filter((expression) => expression.startsWith(normalized));
  const contained = EXPRESSIONS.filter(
    (expression) => !expression.startsWith(normalized) && expression.includes(normalized)
  );
  return [...prefixed, ...contained].slice(0, MAX_COMPLETIONS).map((expression) => ({expression}));
}

export function buildQuerySuggestionsLookupEvents(action: {
  surfaceId?: string;
  sourceComponentId?: string;
  context: Record<string, unknown>;
}): ConverseEvent[] {
  lookupSequence += 1;
  const threadId = `lookup-${lookupSequence}`;
  const runId = `${threadId}-run`;
  const query = typeof action.context['query'] === 'string' ? action.context['query'] : '';
  const componentId = action.sourceComponentId ?? 'root';

  return [
    RunStarted({threadId, runId}),
    UpdateDataModelActivity({
      messageId: `${threadId}-suggestions`,
      ops: [
        {
          surfaceId: action.surfaceId ?? '',
          path: `/state/${componentId}`,
          value: {query, completions: completionsFor(query)},
        },
      ],
    }),
    RunFinished({threadId, runId}),
  ];
}
