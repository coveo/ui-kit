import {
  RENDERER_ROOT_ID,
  buildConversationResponse,
  buildValidatedSurface,
  statePath,
  type A2uiComponentNode,
} from './shared.js';
import {ActivitySnapshot, UpdateDataModelActivity, type ConverseEvent} from '../events.js';

const SEARCH_BOX_ID = 'search-box';
const QUERY_SUGGESTIONS_ID = 'query-suggestions';

const SHELL_NODES: A2uiComponentNode[] = [
  {id: RENDERER_ROOT_ID, component: 'SessionShell', children: [SEARCH_BOX_ID]},
  {id: SEARCH_BOX_ID, component: 'SearchBox', suggestionsChild: QUERY_SUGGESTIONS_ID},
  {
    id: QUERY_SUGGESTIONS_ID,
    component: 'QuerySuggestions',
    query: {path: `${statePath(QUERY_SUGGESTIONS_ID)}/query`},
    completions: {path: `${statePath(QUERY_SUGGESTIONS_ID)}/completions`},
  },
];

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

let runSequence = 0;

function nextRunId(kind: string): string {
  runSequence += 1;
  return `schema-${kind}-${runSequence}`;
}

function buildSessionShellEvents(surfaceId: string): ConverseEvent[] {
  const createSurface = {
    ...buildValidatedSurface({templateName: 'Mock_Session_Shell', surfaceId, nodes: SHELL_NODES}),
    dataModel: {state: {[QUERY_SUGGESTIONS_ID]: {query: '', completions: []}}},
  };
  return buildConversationResponse({
    runId: nextRunId('initialize'),
    middleEvents: [
      ActivitySnapshot({
        messageId: `activity-${surfaceId}`,
        activityType: 'a2ui-surface',
        replace: true,
        content: {messages: [{version: 'v1.0', createSurface}]},
      }),
    ],
    includeInitialStateSnapshot: false,
    includeFinalStateSnapshot: false,
  });
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

function buildQuerySuggestionsEvents(action: {
  surfaceId: string;
  sourceComponentId: string;
  context: Record<string, unknown>;
}): ConverseEvent[] {
  const query = typeof action.context.query === 'string' ? action.context.query : '';
  const runId = nextRunId('suggestions');
  return buildConversationResponse({
    runId,
    middleEvents: [
      UpdateDataModelActivity({
        messageId: `activity-${runId}`,
        ops: [
          {
            surfaceId: action.surfaceId,
            path: statePath(action.sourceComponentId),
            value: {query, completions: completionsFor(query)},
          },
        ],
      }),
    ],
    includeInitialStateSnapshot: false,
    includeFinalStateSnapshot: false,
  });
}

export {buildSessionShellEvents, buildQuerySuggestionsEvents};
