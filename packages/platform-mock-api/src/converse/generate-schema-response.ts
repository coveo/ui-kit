import {buildStreamingResponse} from './events.js';
import {schemaBundleEvents} from './templates/schema-response-bundle.js';
import {schemaDiscoveryEvents} from './templates/schema-response-discovery.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {schemaComparisonEvents} from './templates/schema-response-comparison.js';
import {schemaProductResearchEvents} from './templates/schema-response-product-research.js';
import {
  buildQuerySuggestionsEvents,
  buildSessionShellEvents,
} from './templates/schema-response-session-shell.js';
import {
  buildWaterSportsInitialEvents,
  buildWaterSportsActionEvents,
  keepWaterSportsView,
} from './templates/schema-response-search.js';
import type {ConverseEvent} from './events.js';

const DEFAULT_DELAY_MS = 25;

// Per message (five per action response): ~1s, like a local backend, so optimistic updates show.
const ACTION_DELAY_MS = 200;

// Per message (five per suggestions response): ~150ms, about a real querySuggest round trip.
const SUGGESTIONS_DELAY_MS = 30;

interface SessionKeys {
  conversationSessionId: string;
  conversationToken: string;
}

interface SchemaAction {
  name: string;
  context: Record<string, unknown>;
  surfaceId?: string | null;
  sourceComponentId?: string;
}

function withSessionKeys(events: ConverseEvent[], keys: SessionKeys): ConverseEvent[] {
  return events.map((event) =>
    event.event === 'turn_started' || event.event === 'turn_complete'
      ? {...event, data: {...keys}}
      : event
  );
}

function isInitialize(action: SchemaAction): boolean {
  return action.name === 'initialize' && !action.surfaceId && !action.sourceComponentId;
}

interface SchemaPromptMapping {
  prompt: string;
  // A factory so the stateful "water sports" search surface can reset and rebuild its events
  // on every prompt response; static templates simply return their constant.
  buildEvents: () => ConverseEvent[];
}

const SCHEMA_PROMPT_TEMPLATE_MAP: ReadonlyArray<SchemaPromptMapping> = [
  {
    prompt: 'build a beginner surfing kit with budget, mid-range, and premium options',
    buildEvents: () => schemaBundleEvents,
  },
  {prompt: 'water sports', buildEvents: () => buildWaterSportsInitialEvents()},
  // A misspelled query the search corrects, and a query a query trigger replaces.
  {
    prompt: 'water sprots',
    buildEvents: () =>
      buildWaterSportsInitialEvents({originalQuery: 'water sprots', cause: 'correction'}),
  },
  {
    prompt: 'swim gear',
    buildEvents: () =>
      buildWaterSportsInitialEvents({originalQuery: 'swim gear', cause: 'trigger'}),
  },
  {
    prompt: 'i like cold-water surfing. compare wetsuits for it',
    buildEvents: () => schemaComparisonEvents,
  },
  {prompt: 'boating safety', buildEvents: () => schemaDiscoveryEvents},
  {
    prompt: 'tell me more about the thermoflex winter wetsuit',
    buildEvents: () => schemaProductResearchEvents,
  },
];

// A surface lives for the whole session, from its creation to its deletion (Thermidor ADR-018), so
// a producer mints a new surface id for each surface it creates. Each prompt answer suffixes its
// template's surface ids with the prompt's sequence number, so asking twice draws two blocks.
let promptSequence = 0;

function renameSurfaceIds(value: unknown, rename: (surfaceId: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => renameSurfaceIds(item, rename));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      key === 'surfaceId' && typeof entry === 'string'
        ? rename(entry)
        : renameSurfaceIds(entry, rename),
    ])
  );
}

function withSurfaceIds(
  events: ConverseEvent[],
  rename: (surfaceId: string) => string
): ConverseEvent[] {
  return events.map((event) =>
    event.event === 'ACTIVITY_SNAPSHOT'
      ? {...event, data: renameSurfaceIds(event.data, rename) as ConverseEvent['data']}
      : event
  );
}

// Agent Gateway announces, in the AG-UI metadata of a surface snapshot, the actions whose answer it
// gives as a new turn of the conversation (Thermidor ADR-019): those of a NextActionsBar.
const NEXT_ACTIONS_BAR_TURN_OPENING_ACTIONS = ['selectAction', 'selectSearchOption'];

function nextActionsBarSurfaceIds(messages: unknown): string[] {
  if (!Array.isArray(messages)) {
    return [];
  }
  return messages.flatMap((message) => {
    const operation = message?.createSurface ?? message?.updateComponents;
    const components: unknown = operation?.components;
    const hasNextActionsBar =
      Array.isArray(components) && components.some((node) => node?.component === 'NextActionsBar');
    return hasNextActionsBar && typeof operation.surfaceId === 'string'
      ? [operation.surfaceId]
      : [];
  });
}

function withTurnOpeningAnnouncements(events: ConverseEvent[]): ConverseEvent[] {
  return events.map((event) => {
    if (event.event !== 'ACTIVITY_SNAPSHOT') {
      return event;
    }
    const data = event.data as Record<string, unknown>;
    const content = data['content'] as {messages?: unknown} | undefined;
    const surfaceIds = nextActionsBarSurfaceIds(content?.messages);
    if (surfaceIds.length === 0) {
      return event;
    }
    const turnOpeningActions = Object.fromEntries(
      surfaceIds.map((surfaceId) => [surfaceId, NEXT_ACTIONS_BAR_TURN_OPENING_ACTIONS])
    );
    return {...event, data: {...data, metadata: {turnOpeningActions}}};
  });
}

function matchSchemaPrompt(message: string): ConverseEvent[] {
  const normalized = message.trim().toLowerCase();
  const match = SCHEMA_PROMPT_TEMPLATE_MAP.find((entry) => entry.prompt === normalized);
  return match ? match.buildEvents() : schemaFallbackEvents;
}

const schemaBaseResponse = (body: unknown, session: SessionKeys) => {
  let events = schemaFallbackEvents;
  if (
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof (body as Record<string, unknown>).message === 'string'
  ) {
    events = matchSchemaPrompt((body as Record<string, unknown>).message as string);
  }
  promptSequence += 1;
  const suffix = promptSequence;
  events = withSurfaceIds(events, (surfaceId) => {
    keepWaterSportsView(surfaceId, `${surfaceId}-${suffix}`);
    return `${surfaceId}-${suffix}`;
  });
  events = withTurnOpeningAnnouncements(events);
  return buildStreamingResponse(withSessionKeys(events, session), {
    delayBetweenMessages: DEFAULT_DELAY_MS,
  });
};

// The "water sports" decomposed search surface is the only prompt surface that supports
// component actions and keeps in-memory state, so every other action recomputes that surface.
// Raw action-events builder for the decomposed search surface. buildSchemaActionResponse wraps
// this in a streaming HTTP response; tests use the raw events to assert on component state.
function buildSearchActionEvents(action: SchemaAction): ConverseEvent[] {
  return buildWaterSportsActionEvents(
    action,
    action.sourceComponentId,
    action.surfaceId ?? undefined
  );
}

function buildSchemaActionResponse(action: SchemaAction, session: SessionKeys) {
  if (isInitialize(action)) {
    promptSequence += 1;
    return buildStreamingResponse(
      withSessionKeys(buildSessionShellEvents(`session-shell-${promptSequence}`), session),
      {delayBetweenMessages: DEFAULT_DELAY_MS}
    );
  }
  if (action.name === 'fetchSuggestions' && action.surfaceId && action.sourceComponentId) {
    return buildStreamingResponse(
      withSessionKeys(
        buildQuerySuggestionsEvents({
          surfaceId: action.surfaceId,
          sourceComponentId: action.sourceComponentId,
          context: action.context,
        }),
        session
      ),
      {delayBetweenMessages: SUGGESTIONS_DELAY_MS}
    );
  }
  // The search surface's answer targets the surface the action came from, under the id its prompt
  // minted for it.
  const sourceSurfaceId = action.surfaceId;
  const events = withSurfaceIds(buildSearchActionEvents(action), (surfaceId) =>
    sourceSurfaceId?.startsWith(`${surfaceId}-`) ? sourceSurfaceId : surfaceId
  );
  return buildStreamingResponse(withSessionKeys(events, session), {
    delayBetweenMessages: ACTION_DELAY_MS,
  });
}

export {
  schemaBaseResponse,
  matchSchemaPrompt,
  buildSchemaActionResponse,
  buildSearchActionEvents,
  isInitialize,
};
export type {SchemaAction, SessionKeys};
