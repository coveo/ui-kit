import {buildStreamingResponse, reasoningMessage, type ConverseEvent} from './events.js';
import {matchSchemaPrompt} from './generate-schema-response.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {bindStateFields} from './templates/shared.js';
import {matchStorefrontConversation} from './templates/storefront-conversations.js';
import {
  HOME_CAROUSELS,
  STOREFRONT_COMPONENTS,
  STOREFRONT_CONTEXTS,
  createSurfaceMessage,
  deleteSurfaceMessage,
  isStorefrontContext,
  newSurfaceId,
  rootStateMessage,
  storefrontTurn,
  suggestionsFor,
  surfaceActivity,
  type StorefrontContext,
  type SurfaceMessage,
} from './templates/schema-response-storefront.js';

const DEFAULT_DELAY_MS = 25;
const SUGGESTIONS_DELAY_MS = 350;
const HOME_DELAY_MS = 500;
const REASONING_DELAY_MS = 45;

/**
 * What the mock remembers about one conversation session: the surfaces still alive. One session
 * hosts every view of the page. A page turn replaces the previous page's surfaces, and a
 * suggestions turn replaces the previous suggestions surface, as agent-gateway gives every turn
 * fresh `ui-<uuid>` surfaces.
 */
interface StorefrontSession {
  suggestionsSurfaceId?: string;
  pageSurfaceIds: string[];
}

const sessions = new Map<string, StorefrontSession>();
let runSequence = 0;

function nextRunId(): string {
  runSequence += 1;
  return `storefront-run-${runSequence}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The Storefront Preview view a request names in `context.custom.surfaceId`, or `undefined`
 * when the request is not a Storefront Preview request.
 */
function readStorefrontContext(body: unknown): StorefrontContext | undefined {
  if (!isRecord(body) || !isRecord(body.context) || !isRecord(body.context.custom)) {
    return undefined;
  }
  const value = body.context.custom.surfaceId;
  return isStorefrontContext(value) ? value : undefined;
}

function getSession(sessionId: string): StorefrontSession {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {pageSurfaceIds: []};
    sessions.set(sessionId, session);
  }
  return session;
}

function shellTurn(session: StorefrontSession, query: string): ConverseEvent[] {
  const previous = session.suggestionsSurfaceId;
  const surfaceId = newSurfaceId();
  session.suggestionsSurfaceId = surfaceId;
  return [
    surfaceActivity(`activity-suggestions-${surfaceId}`, [
      ...(previous ? [deleteSurfaceMessage(previous)] : []),
      createSurfaceMessage(surfaceId, {
        component: 'QuerySuggestions',
        ...bindStateFields('root', ['query', 'completions', 'products']),
      }),
    ]),
    {
      ...surfaceActivity(`activity-suggestions-state-${surfaceId}`, [
        rootStateMessage(surfaceId, suggestionsFor(query)),
      ]),
      delayMs: SUGGESTIONS_DELAY_MS,
    },
  ];
}

/** Removes the previous page's surfaces so the new page starts from fresh ones. */
function replacePageSurfaces(session: StorefrontSession, next: string[]): SurfaceMessage[] {
  const deletions = session.pageSurfaceIds.map(deleteSurfaceMessage);
  session.pageSurfaceIds = next;
  return deletions;
}

function homeTurn(session: StorefrontSession): ConverseEvent[] {
  const carousels = HOME_CAROUSELS.map((state) => ({surfaceId: newSurfaceId(), state}));
  return [
    surfaceActivity('activity-home-surfaces', [
      ...replacePageSurfaces(
        session,
        carousels.map(({surfaceId}) => surfaceId)
      ),
      ...carousels.map(({surfaceId}) =>
        createSurfaceMessage(surfaceId, {
          component: 'ProductCarousel',
          ...bindStateFields('root', ['heading', 'products']),
        })
      ),
    ]),
    {
      ...surfaceActivity(
        'activity-home-state',
        carousels.map(({surfaceId, state}) => rootStateMessage(surfaceId, state))
      ),
      delayMs: HOME_DELAY_MS,
    },
  ];
}

const SURFACE_OPERATIONS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
] as const;

const LIFECYCLE_EVENTS = new Set(['turn_started', 'turn_complete', 'RUN_STARTED', 'RUN_FINISHED']);

function eventData(event: ConverseEvent): Record<string, unknown> {
  return event.data as Record<string, unknown>;
}

function isSurfaceActivity(event: ConverseEvent): boolean {
  return event.event === 'ACTIVITY_SNAPSHOT' && eventData(event).activityType === 'a2ui-surface';
}

function surfaceMessagesOf(event: ConverseEvent): Record<string, unknown>[] {
  const content = eventData(event).content;
  return isRecord(content) && Array.isArray(content.messages) ? content.messages : [];
}

function rootComponentsOf(events: ConverseEvent[]): string[] {
  return events
    .filter(isSurfaceActivity)
    .flatMap(surfaceMessagesOf)
    .map((message) => message.createSurface)
    .filter(isRecord)
    .map((createSurface) => {
      const components = Array.isArray(createSurface.components) ? createSurface.components : [];
      const root = components.find((node: unknown) => isRecord(node) && node.id === 'root');
      return isRecord(root) ? String(root.component) : '';
    });
}

// The schema scenarios match exact prompts; the storefront also matches on a keyword so that any
// reasonable question shows an answer.
const CONVERSATION_KEYWORDS: [RegExp, string][] = [
  [/compare|wetsuit|cold/, 'i like cold-water surfing. compare wetsuits for it'],
  [
    /kit|bundle|budget|beginner/,
    'build a beginner surfing kit with budget, mid-range, and premium options',
  ],
  [/tell me more|thermoflex|details?/, 'tell me more about the thermoflex winter wetsuit'],
  [/safety|boat|life jacket/, 'boating safety'],
];

// The schema scenarios have tool calls but no reasoning; the storefront adds the explanation the
// agent streams before them, so every answer opens with a reasoning block.
const SCHEMA_REASONING: Record<string, string> = {
  'i like cold-water surfing. compare wetsuits for it':
    'Cold-water surfing needs thick neoprene and sealed seams. I will search wetsuits rated for cold water, then compare the best three on warmth, flexibility and price.',
  'build a beginner surfing kit with budget, mid-range, and premium options':
    'A beginner kit needs a board, a wetsuit, a bag and wax. I will search each category, then build three tiers so the shopper can pick a budget.',
  'tell me more about the thermoflex winter wetsuit':
    'The shopper wants details on one product. I will look up the ThermoFlex Winter Wetsuit and summarize what matters for cold water.',
  'boating safety':
    'Boating safety starts with life jackets, then vests, helmets and throwables. I will search life jackets and safety gear separately and show each as a carousel.',
};

const FALLBACK_REASONING =
  'I could not match this question to the catalog. I will suggest a few searches the shopper can try instead.';

let reasoningSequence = 0;

/** `events` with a streamed reasoning step first. */
function withReasoning(events: ConverseEvent[], text: string): ConverseEvent[] {
  reasoningSequence += 1;
  const reasoning = reasoningMessage(`reasoning-storefront-${reasoningSequence}`, text).map(
    (event) => ({...event, delayMs: REASONING_DELAY_MS})
  );
  return [...reasoning, ...events];
}

/**
 * The scenario answering an assistant prompt: a storefront conversation, or one of the `/schema`
 * route's scenarios, matched exactly or by keyword, with the reasoning the agent streams first.
 */
function conversationScenario(prompt: string): ConverseEvent[] {
  const normalized = prompt.trim().toLowerCase();
  if (matchSchemaPrompt(normalized) === schemaFallbackEvents) {
    const storefront = matchStorefrontConversation(prompt);
    if (storefront) {
      return storefront;
    }
  }
  const canonical = SCHEMA_REASONING[normalized]
    ? normalized
    : CONVERSATION_KEYWORDS.find(([pattern]) => pattern.test(normalized))?.[1];
  return canonical
    ? withReasoning(matchSchemaPrompt(canonical), SCHEMA_REASONING[canonical])
    : withReasoning(schemaFallbackEvents, FALLBACK_REASONING);
}

/** The assistant answer for a prompt, falling back when a scenario leaves the assistant's components. */
function assistantScenario(prompt: string): ConverseEvent[] {
  const allowed = STOREFRONT_COMPONENTS[STOREFRONT_CONTEXTS.assistant];
  const events = conversationScenario(prompt);
  return rootComponentsOf(events).every((component) => allowed.includes(component))
    ? events
    : withReasoning(schemaFallbackEvents, FALLBACK_REASONING);
}

/**
 * Re-addresses a scenario's surfaces the way agent-gateway names them (`ui-<uuid>`), and lists
 * the ones still alive at its end.
 */
function withFreshSurfaceIds(events: ConverseEvent[]): {
  events: ConverseEvent[];
  surfaceIds: string[];
} {
  const surfaceIds = new Map<string, string>();
  const readdress = (surfaceId: unknown) => {
    const id = String(surfaceId);
    if (!surfaceIds.has(id)) {
      surfaceIds.set(id, newSurfaceId());
    }
    return surfaceIds.get(id)!;
  };

  const readdressed = events
    .filter(
      (event) => !LIFECYCLE_EVENTS.has(event.event) && eventData(event).type !== 'STATE_SNAPSHOT'
    )
    .map((event) => {
      if (!isSurfaceActivity(event)) {
        return event;
      }
      const messages = surfaceMessagesOf(event).map((message) => {
        for (const operation of SURFACE_OPERATIONS) {
          const body = message[operation];
          if (isRecord(body)) {
            return {...message, [operation]: {...body, surfaceId: readdress(body.surfaceId)}};
          }
        }
        return message;
      });
      const data = eventData(event);
      return {...event, data: {...data, content: {...(data.content as object), messages}}};
    });

  // A scenario may delete its own surfaces, such as a loading placeholder its content replaces.
  const deletedIds = new Set(
    readdressed
      .filter(isSurfaceActivity)
      .flatMap(surfaceMessagesOf)
      .map((message) => message.deleteSurface)
      .filter(isRecord)
      .map((deleteSurface) => String(deleteSurface.surfaceId))
  );
  return {
    events: readdressed,
    surfaceIds: [...surfaceIds.values()].filter((surfaceId) => !deletedIds.has(surfaceId)),
  };
}

function assistantTurn(session: StorefrontSession, prompt: string): ConverseEvent[] {
  const {events, surfaceIds} = withFreshSurfaceIds(assistantScenario(prompt));
  const deletions = replacePageSurfaces(session, surfaceIds);
  return [
    ...(deletions.length ? [surfaceActivity('activity-assistant-deletions', deletions)] : []),
    ...events,
  ];
}

/**
 * Builds the events of one Storefront Preview turn. The request's view decides what answers; the
 * session decides which surfaces the turn replaces. A component action gets an empty run: the
 * storefront's components send none that the mock answers.
 */
function buildStorefrontEvents(body: unknown): ConverseEvent[] {
  const request = isRecord(body) ? body : {};
  const context = readStorefrontContext(body);
  const sessionId =
    typeof request.conversationSessionId === 'string' && request.conversationSessionId
      ? request.conversationSessionId
      : crypto.randomUUID();
  const session = getSession(sessionId);
  const prompt = typeof request.message === 'string' ? request.message.trim() : '';

  let middleEvents: ConverseEvent[];
  if (isRecord(request.action)) {
    middleEvents = [];
  } else if (context === STOREFRONT_CONTEXTS.shell) {
    middleEvents = shellTurn(session, prompt);
  } else if (context === STOREFRONT_CONTEXTS.home) {
    middleEvents = homeTurn(session);
  } else {
    middleEvents = assistantTurn(session, prompt);
  }

  return storefrontTurn({sessionId, runId: nextRunId(), middleEvents});
}

function storefrontResponse(body: unknown) {
  return buildStreamingResponse(buildStorefrontEvents(body), {
    delayBetweenMessages: DEFAULT_DELAY_MS,
  });
}

/** Forgets every session. For tests. */
function resetStorefrontSessions(): void {
  sessions.clear();
}

export {buildStorefrontEvents, readStorefrontContext, resetStorefrontSessions, storefrontResponse};
