import {buildStreamingResponse} from './events.js';
import {schemaBundleEvents} from './templates/schema-response-bundle.js';
import {schemaDiscoveryEvents} from './templates/schema-response-discovery.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {schemaComparisonEvents} from './templates/schema-response-comparison.js';
import {schemaProductResearchEvents} from './templates/schema-response-product-research.js';
import {
  buildWaterSportsInitialEvents,
  buildWaterSportsActionEvents,
} from './templates/schema-response-search.js';
import type {ConverseEvent} from './events.js';

const DEFAULT_DELAY_MS = 25;

// Per message (five per action response): ~1s, like a local backend, so optimistic updates show.
const ACTION_DELAY_MS = 200;

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

function matchSchemaPrompt(message: string): ConverseEvent[] {
  const normalized = message.trim().toLowerCase();
  const match = SCHEMA_PROMPT_TEMPLATE_MAP.find((entry) => entry.prompt === normalized);
  return match ? match.buildEvents() : schemaFallbackEvents;
}

const schemaBaseResponse = (body?: unknown) => {
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
  events = withSurfaceIds(events, (surfaceId) => `${surfaceId}-${suffix}`);
  return buildStreamingResponse(events, {delayBetweenMessages: DEFAULT_DELAY_MS});
};

// The "water sports" decomposed search surface is the only surface that supports component
// actions and keeps in-memory state, so every action recomputes that surface.
// Raw action-events builder for the decomposed search surface. buildSchemaActionResponse wraps
// this in a streaming HTTP response; tests use the raw events to assert on component state.
function buildSearchActionEvents(action: {
  name: string;
  context: Record<string, unknown>;
  sourceComponentId?: string;
  surfaceId?: string;
}): ConverseEvent[] {
  return buildWaterSportsActionEvents(action, action.sourceComponentId, action.surfaceId);
}

function buildSchemaActionResponse(action: {
  name: string;
  context: Record<string, unknown>;
  sourceComponentId?: string;
  surfaceId?: string;
}) {
  // The search surface's answer targets the surface the action came from, under the id its prompt
  // minted for it.
  const sourceSurfaceId = action.surfaceId;
  const events = withSurfaceIds(buildSearchActionEvents(action), (surfaceId) =>
    sourceSurfaceId?.startsWith(`${surfaceId}-`) ? sourceSurfaceId : surfaceId
  );
  return buildStreamingResponse(events, {delayBetweenMessages: ACTION_DELAY_MS});
}

export {schemaBaseResponse, matchSchemaPrompt, buildSchemaActionResponse, buildSearchActionEvents};
