import {buildStreamingResponse, type ConverseEvent} from './events.js';
import {matchSchemaPrompt} from './generate-schema-response.js';
import {schemaFallbackEvents} from './templates/schema-response-fallback.js';
import {bindStateFields} from './templates/shared.js';
import {
  HOME_CAROUSELS,
  LAYOUT_SLOTS,
  STOREFRONT_COMPONENTS,
  STOREFRONT_CONTEXTS,
  createSurfaceMessage,
  deleteSurfaceMessage,
  isStorefrontContext,
  layoutMetadata,
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

/**
 * What the mock remembers about one conversation session: the surfaces it created that are still
 * alive. One session hosts every area of the page, so a page turn only replaces the `main`
 * surfaces and leaves the header's surfaces in place.
 */
interface StorefrontSession {
  cartSurfaceId?: string;
  suggestionsSurfaceId?: string;
  mainSurfaceIds: string[];
}

const sessions = new Map<string, StorefrontSession>();
let runSequence = 0;

function nextRunId(): string {
  runSequence += 1;
  return `storefront-run-${runSequence}`;
}

interface StorefrontRequest {
  conversationSessionId?: string;
  message?: string | null;
  action?: {
    name: string;
    surfaceId?: string;
    sourceComponentId?: string;
    context?: Record<string, unknown>;
  } | null;
  context?: {custom?: Record<string, unknown>};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The Storefront Preview context a request names in `context.custom.surfaceId`, or `undefined`
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
    session = {mainSurfaceIds: []};
    sessions.set(sessionId, session);
  }
  return session;
}

/**
 * The cart is session-level: whichever area opens the session, its first turn creates the cart
 * surface, so the header shows it on every page.
 */
function ensureCartSurface(session: StorefrontSession): SurfaceMessage[] {
  if (session.cartSurfaceId) {
    return [];
  }
  session.cartSurfaceId = newSurfaceId();
  return [
    createSurfaceMessage(session.cartSurfaceId, LAYOUT_SLOTS.headerCart, {component: 'Cart'}),
  ];
}

/** Removes the previous page's surfaces so the new page starts from fresh ones. */
function replaceMainSurfaces(session: StorefrontSession, next: string[]): SurfaceMessage[] {
  const deletions = session.mainSurfaceIds.map(deleteSurfaceMessage);
  session.mainSurfaceIds = next;
  return deletions;
}

function shellTurn(session: StorefrontSession, query: string): ConverseEvent[] {
  const lifecycle = ensureCartSurface(session);
  if (!session.suggestionsSurfaceId) {
    session.suggestionsSurfaceId = newSurfaceId();
    lifecycle.push(
      createSurfaceMessage(session.suggestionsSurfaceId, LAYOUT_SLOTS.headerSuggestions, {
        component: 'QuerySuggestions',
        ...bindStateFields('root', ['query', 'completions', 'products']),
      })
    );
  }
  return [
    ...(lifecycle.length ? [surfaceActivity('activity-shell-surfaces', lifecycle)] : []),
    {
      ...surfaceActivity('activity-shell-suggestions', [
        rootStateMessage(session.suggestionsSurfaceId, suggestionsFor(query)),
      ]),
      delayMs: SUGGESTIONS_DELAY_MS,
    },
  ];
}

function homeTurn(session: StorefrontSession): ConverseEvent[] {
  const carousels = HOME_CAROUSELS.map((state) => ({surfaceId: newSurfaceId(), state}));
  const messages: SurfaceMessage[] = [
    ...ensureCartSurface(session),
    ...replaceMainSurfaces(
      session,
      carousels.map(({surfaceId}) => surfaceId)
    ),
    ...carousels.map(({surfaceId}) =>
      createSurfaceMessage(surfaceId, LAYOUT_SLOTS.main, {
        component: 'ProductCarousel',
        ...bindStateFields('root', ['heading', 'products']),
      })
    ),
  ];
  return [
    surfaceActivity('activity-home-surfaces', messages),
    {
      ...surfaceActivity(
        'activity-home-state',
        carousels.map(({surfaceId, state}) => rootStateMessage(surfaceId, state))
      ),
      delayMs: HOME_DELAY_MS,
    },
  ];
}

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

/**
 * The assistant answer for a prompt. It reuses the `/schema` route's scenarios, falling back when
 * a scenario uses a component outside the assistant area.
 */
function assistantScenario(prompt: string): ConverseEvent[] {
  const allowed = STOREFRONT_COMPONENTS[STOREFRONT_CONTEXTS.assistant];
  const events = matchSchemaPrompt(prompt);
  return rootComponentsOf(events).every((component) => allowed.includes(component))
    ? events
    : schemaFallbackEvents;
}

/**
 * Re-addresses a scenario's surfaces the way agent-gateway names them (`ui-<uuid>`), and gives
 * each one the `main` layout slot.
 */
function placeInMain(events: ConverseEvent[]): {events: ConverseEvent[]; surfaceIds: string[]} {
  const surfaceIds = new Map<string, string>();
  const readdress = (surfaceId: unknown) => {
    const id = String(surfaceId);
    if (!surfaceIds.has(id)) {
      surfaceIds.set(id, newSurfaceId());
    }
    return surfaceIds.get(id)!;
  };

  const placed = events
    .filter(
      (event) => !LIFECYCLE_EVENTS.has(event.event) && eventData(event).type !== 'STATE_SNAPSHOT'
    )
    .map((event) => {
      if (!isSurfaceActivity(event)) {
        return event;
      }
      const messages = surfaceMessagesOf(event).map((message) => {
        if (isRecord(message.createSurface)) {
          return {
            ...message,
            createSurface: {
              ...message.createSurface,
              surfaceId: readdress(message.createSurface.surfaceId),
              metadata: layoutMetadata(LAYOUT_SLOTS.main),
            },
          };
        }
        if (isRecord(message.updateDataModel)) {
          return {
            ...message,
            updateDataModel: {
              ...message.updateDataModel,
              surfaceId: readdress(message.updateDataModel.surfaceId),
            },
          };
        }
        return message;
      });
      const data = eventData(event);
      return {...event, data: {...data, content: {...(data.content as object), messages}}};
    });

  return {events: placed, surfaceIds: [...surfaceIds.values()]};
}

function assistantTurn(session: StorefrontSession, prompt: string): ConverseEvent[] {
  const {events, surfaceIds} = placeInMain(assistantScenario(prompt));
  const lifecycle = [...ensureCartSurface(session), ...replaceMainSurfaces(session, surfaceIds)];
  return [
    ...(lifecycle.length ? [surfaceActivity('activity-assistant-lifecycle', lifecycle)] : []),
    ...events,
  ];
}

/**
 * The answer to a component action. `fetchSuggestions` refreshes the suggestions surface in
 * place; cart actions are acknowledged, since the cart's contents travel in `context.cart`.
 */
function actionTurn(
  session: StorefrontSession,
  action: NonNullable<StorefrontRequest['action']>
): ConverseEvent[] {
  if (
    action.name === 'fetchSuggestions' &&
    action.surfaceId === session.suggestionsSurfaceId &&
    typeof action.context?.query === 'string'
  ) {
    return shellTurn(session, action.context.query);
  }
  return [];
}

/**
 * Builds the events of one Storefront Preview turn. The request's context decides which area
 * answers; the session decides which surfaces already exist.
 */
function buildStorefrontEvents(body: unknown): ConverseEvent[] {
  const request = (isRecord(body) ? body : {}) as StorefrontRequest;
  const context = readStorefrontContext(body);
  const sessionId = request.conversationSessionId || crypto.randomUUID();
  const session = getSession(sessionId);
  const prompt = typeof request.message === 'string' ? request.message.trim() : '';

  let middleEvents: ConverseEvent[];
  if (request.action) {
    middleEvents = actionTurn(session, request.action);
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
