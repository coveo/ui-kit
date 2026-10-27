import {encodeSSEEvent, reasoningMessage, textMessage, type ConverseEvent} from './events.js';
import {matchSchemaPrompt} from './generate-schema-response.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {
  buildWaterSportsActionEvents,
  buildWaterSportsInitialEvents,
  cheapestWaterSportsProduct,
  describeWaterSportsView,
} from './templates/schema-response-search.js';
import {matchStorefrontConversation} from './templates/storefront-conversations.js';

/**
 * A backend that hosts several views on one conversation session. The client names its view in
 * `context.custom.surfaceId`, and the server keeps the session's state between requests:
 *
 * - every surface it sent, until the agent deletes it, so a new turn never drops another view's;
 * - the search behind each `searchOption` next action, sent to the client as an id only, and each
 *   search surface, whose actions are answered from the search it keeps for that surface;
 * - the cart: the request's `context.cart` replaces it, then an `updateCart` action applies to it;
 * - one turn at a time: another one while it runs gets a 409.
 *
 * On `storefront-preview-assistant`, a message runs the agent, which is told what the shopper is
 * looking at: the latest search surface. Asked for the cheapest product, it answers from that
 * surface's kept search. On `storefront-preview-search`, a message opens a search surface for that query. On
 * both, an action is answered by the server. `storefront-preview` and `storefront-preview-home` get
 * an empty run, and any other view is refused with a 400.
 */

const VIEWS = {
  assistant: 'storefront-preview-assistant',
  search: 'storefront-preview-search',
  shell: 'storefront-preview',
  home: 'storefront-preview-home',
} as const;

type SurfaceKind = 'agent' | 'search';

interface Session {
  token: string;
  /** Every surface still alive, and who answers its actions. */
  surfaces: Map<string, SurfaceKind>;
  /** The query behind each search option, by option id. */
  searchOptions: Map<string, string>;
  cart: Map<string, number>;
  turnInProgress: boolean;
}

interface Action {
  name: string;
  surfaceId?: string;
  sourceComponentId?: string;
  context?: Record<string, unknown>;
}

const sessions = new Map<string, Session>();

const AGENT_COMPONENTS = [
  'ProductCarousel',
  'NextActionsBar',
  'ComparisonTable',
  'BundleDisplay',
  'ProductResearchCard',
];

// The schema scenarios match exact prompts; the agent also matches on a keyword so that any
// reasonable question shows an answer, and streams its reasoning first.
const CONVERSATION_KEYWORDS: [RegExp, string, string][] = [
  [
    /compare|wetsuit|cold/,
    'i like cold-water surfing. compare wetsuits for it',
    'Cold-water surfing needs thick neoprene and sealed seams. I will search wetsuits rated for cold water, then compare the best three on warmth, flexibility and price.',
  ],
  [
    /kit|bundle|budget|beginner/,
    'build a beginner surfing kit with budget, mid-range, and premium options',
    'A beginner kit needs a board, a wetsuit, a bag and wax. I will search each category, then build three tiers so the shopper can pick a budget.',
  ],
  [
    /tell me more|thermoflex|details?/,
    'tell me more about the thermoflex winter wetsuit',
    'The shopper wants details on one product. I will look up the ThermoFlex Winter Wetsuit and summarize what matters for cold water.',
  ],
  [
    /safety|boat|life jacket/,
    'boating safety',
    'Boating safety starts with life jackets, then vests, helmets and throwables. I will search life jackets and safety gear separately and show each as a carousel.',
  ],
];

// A question about the search on screen, answered from the search kept for it.
const CHEAPEST_QUESTION = /cheapest|least expensive|lowest price|lowest-priced/;

const CHEAPEST_REASONING =
  'The shopper asks for the cheapest product of the search on screen. I will compare the prices of every result of that search, not only the visible page.';

const FALLBACK_REASONING =
  'I could not match this question to the catalog. I will suggest a few searches the shopper can try instead.';

const LIFECYCLE_EVENTS = new Set(['turn_started', 'turn_complete', 'RUN_STARTED', 'RUN_FINISHED']);
const EVENT_DELAY_MS = 25;

let reasoningSequence = 0;
let answerSequence = 0;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function dataOf(event: ConverseEvent): Record<string, unknown> {
  return event.data as Record<string, unknown>;
}

function isSurfaceActivity(event: ConverseEvent): boolean {
  return event.event === 'ACTIVITY_SNAPSHOT' && dataOf(event).activityType === 'a2ui-surface';
}

function messagesOf(event: ConverseEvent): Record<string, Record<string, unknown>>[] {
  const content = dataOf(event).content;
  return isRecord(content) && Array.isArray(content.messages) ? content.messages : [];
}

function withMessages(event: ConverseEvent, messages: unknown[]): ConverseEvent {
  const data = dataOf(event);
  return {...event, data: {...data, content: {...(data.content as object), messages}}};
}

function withReasoning(events: ConverseEvent[], text: string): ConverseEvent[] {
  reasoningSequence += 1;
  return [...reasoningMessage(`reasoning-agent-${reasoningSequence}`, text), ...events];
}

/** The A2-UI operation of a message, and the surface it addresses. */
function operationOf(message: Record<string, Record<string, unknown>>) {
  const name = Object.keys(message).find((key) => key !== 'version')!;
  return {name, body: message[name], surfaceId: String(message[name]?.surfaceId)};
}

function rootComponentOf(createSurface: Record<string, unknown>): string {
  const nodes = Array.isArray(createSurface.components) ? createSurface.components : [];
  return String(nodes.find((node: Record<string, unknown>) => node.id === 'root')?.component ?? '');
}

/** The agent's answer to a prompt: a storefront conversation, or a schema scenario. */
function agentScenario(prompt: string): ConverseEvent[] {
  const normalized = prompt.trim().toLowerCase();
  if (matchSchemaPrompt(normalized) === schemaFallbackEvents) {
    const storefront = matchStorefrontConversation(prompt);
    if (storefront) {
      return storefront;
    }
  }
  const match =
    CONVERSATION_KEYWORDS.find(([, canonical]) => canonical === normalized) ??
    CONVERSATION_KEYWORDS.find(([pattern]) => pattern.test(normalized));
  const events = match
    ? withReasoning(matchSchemaPrompt(match[1]), match[2])
    : withReasoning(schemaFallbackEvents, FALLBACK_REASONING);
  const roots = events
    .filter(isSurfaceActivity)
    .flatMap(messagesOf)
    .filter((message) => message.createSurface)
    .map((message) => rootComponentOf(message.createSurface));
  return roots.every((root) => AGENT_COMPONENTS.includes(root))
    ? events
    : withReasoning(schemaFallbackEvents, FALLBACK_REASONING);
}

/** Applies `rewrite` to every A2-UI message of the surface activities. */
function mapSurfaceMessages(
  events: ConverseEvent[],
  rewrite: (message: Record<string, Record<string, unknown>>) => Record<string, unknown>
): ConverseEvent[] {
  return events.map((event) =>
    isSurfaceActivity(event) ? withMessages(event, messagesOf(event).map(rewrite)) : event
  );
}

/** Addresses every surface message to `surfaceId`. */
function toSurface(events: ConverseEvent[], surfaceId: string): ConverseEvent[] {
  return mapSurfaceMessages(events, (message) => {
    const {name, body} = operationOf(message);
    return {...message, [name]: {...body, surfaceId}};
  });
}

/** The agent's answer naming the cheapest product of the search kept for a search surface. */
function cheapestAnswerEvents(searchSurfaceId: string): ConverseEvent[] {
  const product = cheapestWaterSportsProduct(searchSurfaceId);
  answerSequence += 1;
  const text = product
    ? `The cheapest of these results is the ${product.ec_name}, at $${product.ec_price.toFixed(2)}.`
    : 'There are no results on screen to compare.';
  return withReasoning(textMessage(`answer-agent-${answerSequence}`, text), CHEAPEST_REASONING);
}

/**
 * The agent's answer as the server forwards it, told what the shopper is looking at: the latest
 * search surface of the session, whichever view drew it.
 */
function agentTurnEvents(session: Session, prompt: string): ConverseEvent[] {
  const latestSearch = [...session.surfaces]
    .filter(([, kind]) => kind === 'search')
    .map(([surfaceId]) => surfaceId)
    .at(-1);
  if (!latestSearch) {
    return scenarioTurnEvents(session, prompt);
  }
  const answer = CHEAPEST_QUESTION.test(prompt.toLowerCase())
    ? cheapestAnswerEvents(latestSearch)
    : scenarioTurnEvents(session, prompt);
  return withReasoning(
    answer,
    `The shopper is looking at ${describeWaterSportsView(latestSearch)}.`
  );
}

/**
 * A scenario's answer as the server forwards it: each surface under a fresh `ui-<uuid>` id,
 * recorded in the session, and each search option's search kept on the server and removed from the
 * client's.
 */
function scenarioTurnEvents(session: Session, prompt: string): ConverseEvent[] {
  const ids = new Map<string, string>();
  const freshId = (surfaceId: string) => {
    if (!ids.has(surfaceId)) {
      ids.set(surfaceId, `ui-${crypto.randomUUID()}`);
    }
    return ids.get(surfaceId)!;
  };
  const stripSearchOptions = (value: unknown): unknown => {
    if (!isRecord(value) || !Array.isArray(value.suggestedActions)) {
      return value;
    }
    const suggestedActions = value.suggestedActions.map((item: Record<string, unknown>) => {
      if (item.type !== 'searchOption' || !isRecord(item.search)) {
        return item;
      }
      session.searchOptions.set(String(item.optionId), String(item.search.query));
      return {text: item.text, type: item.type, optionId: item.optionId};
    });
    return {...value, suggestedActions};
  };

  const scenario = agentScenario(prompt).filter(
    (event) =>
      !LIFECYCLE_EVENTS.has(event.event) &&
      !LIFECYCLE_EVENTS.has(String(dataOf(event).type)) &&
      dataOf(event).type !== 'STATE_SNAPSHOT'
  );
  return mapSurfaceMessages(scenario, (message) => {
    const {name, body, surfaceId} = operationOf(message);
    const id = freshId(surfaceId);
    if (name === 'createSurface') {
      session.surfaces.set(id, 'agent');
    } else if (name === 'deleteSurface') {
      session.surfaces.delete(id);
    }
    const forwarded: Record<string, unknown> = {...body, surfaceId: id};
    if (name === 'updateDataModel') {
      forwarded.value = stripSearchOptions(body.value);
    }
    return {...message, [name]: forwarded};
  });
}

/** A search surface for `query` under a fresh id, whose search is kept to answer its actions. */
function searchEvents(session: Session, query: string): ConverseEvent[] {
  const surfaceId = `ui-${crypto.randomUUID()}`;
  session.surfaces.set(surfaceId, 'search');
  return toSurface(buildWaterSportsInitialEvents(query, surfaceId), surfaceId);
}

/** Replaces the kept cart with the one the client sent in `context.cart`, when it sent one. */
function syncCart(session: Session, cart: unknown): void {
  if (!Array.isArray(cart)) {
    return;
  }
  session.cart = new Map(
    cart
      .filter((item) => isRecord(item) && typeof item.productId === 'string')
      .map((item) => [item.productId as string, Number(item.quantity ?? 1)])
  );
}

/** The server's answer to an action. A refusal throws before anything is streamed. */
function actionEvents(session: Session, action: Action): ConverseEvent[] {
  const context = action.context ?? {};
  if (action.name === 'selectSearchOption') {
    const query = session.searchOptions.get(String(context.optionId));
    if (query === undefined) {
      throw new HttpError(400, `No search option found: ${String(context.optionId)}`);
    }
    return searchEvents(session, query);
  }
  if (action.name === 'updateCart') {
    const productId = String(context.productId);
    const quantity = Number(context.quantity ?? 1);
    const current = session.cart.get(productId) ?? 0;
    const next =
      context.operation === 'remove'
        ? current - quantity
        : context.operation === 'setQuantity'
          ? quantity
          : current + quantity;
    if (next > 0) {
      session.cart.set(productId, next);
    } else {
      session.cart.delete(productId);
    }
    return [];
  }
  const surfaceId = action.surfaceId ?? '';
  if (session.surfaces.get(surfaceId) !== 'search') {
    throw new HttpError(400, `No search surface found: ${action.surfaceId}`);
  }
  return toSurface(
    buildWaterSportsActionEvents({name: action.name, context}, action.sourceComponentId, surfaceId),
    surfaceId
  );
}

function runEvents(sessionId: string, session: Session, middle: ConverseEvent[]): ConverseEvent[] {
  const runId = crypto.randomUUID();
  return [
    runEvent('RUN_STARTED', sessionId, session, runId),
    ...middle,
    runEvent('RUN_FINISHED', sessionId, session, runId),
  ];
}

function runEvent(
  type: 'RUN_STARTED' | 'RUN_FINISHED',
  sessionId: string,
  session: Session,
  runId: string
) {
  return {
    event: type,
    data: {
      type,
      threadId: sessionId,
      runId,
      conversationSessionId: sessionId,
      conversationToken: session.token,
    },
  } satisfies ConverseEvent;
}

function sseResponse(events: ConverseEvent[], paced: boolean, onEnd: () => void): Response {
  const encoder = new TextEncoder();
  let ended = false;
  const end = () => {
    if (!ended) {
      ended = true;
      onEnd();
    }
  };
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const event of events) {
        await new Promise((resolve) =>
          setTimeout(resolve, paced ? (event.delayMs ?? EVENT_DELAY_MS) : 0)
        );
        if (ended) {
          return;
        }
        if (event.event === 'RUN_FINISHED') {
          // The next turn may start as soon as the client sees this one end.
          end();
        }
        controller.enqueue(encoder.encode(encodeSSEEvent(event)));
      }
      end();
      controller.close();
    },
    cancel: end,
  });
  return new Response(stream, {
    headers: {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform'},
  });
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({message}), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}

/** Whether a request names a view in `context.custom.surfaceId`, and so is for this backend. */
function isMultiSurfaceRequest(body: unknown): boolean {
  return (
    isRecord(body) &&
    isRecord(body.context) &&
    isRecord(body.context.custom) &&
    typeof body.context.custom.surfaceId === 'string'
  );
}

/** Answers one request. `paced` spaces the events out like a live stream; tests turn it off. */
function multiSurfaceResponse(body: unknown, {paced = true}: {paced?: boolean} = {}): Response {
  if (!isRecord(body) || !isRecord(body.context) || !isRecord(body.context.custom)) {
    return jsonError(400, 'context.custom.surfaceId is required.');
  }
  const view = body.context.custom.surfaceId;
  if (!Object.values(VIEWS).includes(view as never)) {
    return jsonError(
      400,
      `context.custom.surfaceId must be one of ${Object.values(VIEWS).join(', ')}.`
    );
  }
  let action = isRecord(body.action) ? (body.action as unknown as Action) : null;
  let message = typeof body.message === 'string' ? body.message.trim() : '';
  // A next-action chip with text is the shopper sending that text.
  if (action?.name === 'selectAction' && typeof action.context?.text === 'string') {
    message = action.context.text;
    action = null;
  }
  if (!message && !action) {
    return jsonError(400, 'Either message or action must be provided.');
  }

  const sessionId =
    typeof body.conversationSessionId === 'string' && body.conversationSessionId
      ? body.conversationSessionId
      : crypto.randomUUID();
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      token: crypto.randomUUID(),
      surfaces: new Map(),
      searchOptions: new Map(),
      cart: new Map(),
      turnInProgress: false,
    };
    sessions.set(sessionId, session);
  } else if (body.conversationToken !== session.token) {
    return jsonError(403, 'Invalid conversation token.');
  }

  syncCart(session, body.context.cart);
  if (view === VIEWS.home || view === VIEWS.shell) {
    return sseResponse(runEvents(sessionId, session, []), paced, () => {});
  }
  if (session.turnInProgress) {
    return jsonError(409, 'Another turn is in progress for this session.');
  }
  let middle: ConverseEvent[];
  try {
    middle = action
      ? actionEvents(session, action)
      : view === VIEWS.search
        ? searchEvents(session, message)
        : agentTurnEvents(session, message);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message);
    }
    console.error('[multi-surface mock] Failed to answer the request:', error);
    return jsonError(500, 'Internal server error.');
  }
  session.turnInProgress = true;
  const current = session;
  const events = runEvents(
    sessionId,
    session,
    middle.filter(
      (event) => !LIFECYCLE_EVENTS.has(event.event) && dataOf(event).type !== 'STATE_SNAPSHOT'
    )
  );
  return sseResponse(events, paced, () => {
    current.turnInProgress = false;
  });
}

/** What the server keeps for each session. */
function inspectSessions() {
  return Object.fromEntries(
    [...sessions].map(([sessionId, session]) => [
      sessionId,
      {
        surfaces: Object.fromEntries(session.surfaces),
        searchOptions: Object.fromEntries(session.searchOptions),
        cart: Object.fromEntries(session.cart),
        turnInProgress: session.turnInProgress,
      },
    ])
  );
}

/** Forgets every session. For tests. */
function resetMultiSurfaceSessions(): void {
  sessions.clear();
}

export {inspectSessions, isMultiSurfaceRequest, multiSurfaceResponse, resetMultiSurfaceSessions};
