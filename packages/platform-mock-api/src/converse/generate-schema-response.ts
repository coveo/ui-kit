import {buildStreamingResponse} from './events.js';
import {schemaBundleEvents} from './templates/schema-response-bundle.js';
import {schemaDiscoveryEvents} from './templates/schema-response-discovery.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {schemaComparisonEvents} from './templates/schema-response-comparison.js';
import {schemaSearchEvents} from './templates/schema-response-search.js';
import type {ConverseEvent} from './events.js';

const DEFAULT_DELAY_MS = 25;

interface SchemaPromptMapping {
  prompt: string;
  events: ConverseEvent[];
}

const SCHEMA_PROMPT_TEMPLATE_MAP: ReadonlyArray<SchemaPromptMapping> = [
  {
    prompt: 'build a beginner surfing kit with budget, mid-range, and premium options',
    events: schemaBundleEvents,
  },
  {prompt: 'wetsuits', events: schemaSearchEvents},
  {
    prompt: 'i like cold-water surfing. compare wetsuits for it',
    events: schemaComparisonEvents,
  },
  {prompt: 'boating safety', events: schemaDiscoveryEvents},
];

function matchSchemaPrompt(message: string): ConverseEvent[] {
  const normalized = message.trim().toLowerCase();
  const match = SCHEMA_PROMPT_TEMPLATE_MAP.find((entry) => entry.prompt === normalized);
  return match ? match.events : schemaFallbackEvents;
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

export {schemaBaseResponse, matchSchemaPrompt};
