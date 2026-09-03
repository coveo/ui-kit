import {buildStreamingResponse} from './events.js';
import {schemaBundleEvents} from './templates/schema-response-bundle.js';
import {schemaDiscoveryEvents} from './templates/schema-response-discovery.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {schemaComparisonEvents} from './templates/schema-response-comparison.js';
import {
  buildWaterSportsInitialEvents,
  buildWaterSportsActionEvents,
} from './templates/schema-response-search.js';
import type {ConverseEvent} from './events.js';

const DEFAULT_DELAY_MS = 25;

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
];

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
}): ConverseEvent[] {
  return buildWaterSportsActionEvents(action, action.sourceComponentId);
}

function buildSchemaActionResponse(action: {
  name: string;
  context: Record<string, unknown>;
  sourceComponentId?: string;
}) {
  const events = buildSearchActionEvents(action);
  return buildStreamingResponse(events, {delayBetweenMessages: DEFAULT_DELAY_MS});
}

export {schemaBaseResponse, matchSchemaPrompt, buildSchemaActionResponse, buildSearchActionEvents};
