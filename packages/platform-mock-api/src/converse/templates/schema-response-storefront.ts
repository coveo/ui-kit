import {CATALOG_ID, RENDERER_ROOT_ID, statePath} from './shared.js';
import {lifeJacketsState, safetyGearState} from './schema-response-discovery.js';
import {
  ActivitySnapshot,
  RunFinished,
  RunStarted,
  TurnComplete,
  TurnStarted,
  type ConverseEvent,
} from '../events.js';

/**
 * The Storefront Preview contexts a client sends in `context.custom.surfaceId`, mirroring the
 * values agent-gateway's private route reads today. Each one names an area of the page, not an
 * A2-UI surface: the surfaces themselves get server-chosen `ui-<uuid>` ids.
 */
const STOREFRONT_CONTEXTS = {
  shell: 'storefront-preview',
  home: 'storefront-preview-home',
  assistant: 'storefront-preview-assistant',
} as const;

type StorefrontContext = (typeof STOREFRONT_CONTEXTS)[keyof typeof STOREFRONT_CONTEXTS];

/**
 * The surface-scope A2-UI v1.0 extension carrying the layout hint. A2-UI reserves the `a2ui_`
 * prefix, so a third-party extension is prefixed with its organization.
 */
const LAYOUT_EXTENSION = 'coveo_layout';

/**
 * The layout slots a surface can ask for. The client decides where each slot is drawn; the server
 * only says which kind of place a surface belongs in.
 */
const LAYOUT_SLOTS = {
  headerSuggestions: 'header.suggestions',
  headerCart: 'header.cart',
  main: 'main',
} as const;

type LayoutSlot = (typeof LAYOUT_SLOTS)[keyof typeof LAYOUT_SLOTS];

/**
 * The public `@coveo/thermidor-schema` components each area may use. Declared here rather than
 * read from a schema document: the per-area membership is not part of the public schema.
 */
const STOREFRONT_COMPONENTS: Readonly<Record<StorefrontContext, readonly string[]>> = {
  [STOREFRONT_CONTEXTS.shell]: ['QuerySuggestions', 'Cart'],
  [STOREFRONT_CONTEXTS.home]: ['ProductCarousel'],
  [STOREFRONT_CONTEXTS.assistant]: [
    'ProductCarousel',
    'NextActionsBar',
    'ComparisonTable',
    'BundleDisplay',
    'ProductResearchCard',
  ],
};

function isStorefrontContext(value: unknown): value is StorefrontContext {
  return Object.values(STOREFRONT_CONTEXTS).includes(value as StorefrontContext);
}

function newSurfaceId(): string {
  return `ui-${crypto.randomUUID()}`;
}

function layoutMetadata(slot: LayoutSlot) {
  return {extensions: {[LAYOUT_EXTENSION]: {slot}}};
}

interface SurfaceMessage {
  version: 'v1.0';
  [operation: string]: unknown;
}

function surfaceActivity(messageId: string, messages: SurfaceMessage[]): ConverseEvent {
  return ActivitySnapshot({
    messageId,
    activityType: 'a2ui-surface',
    replace: true,
    content: {messages},
  });
}

function createSurfaceMessage(
  surfaceId: string,
  slot: LayoutSlot,
  rootComponent: Record<string, unknown>
): SurfaceMessage {
  return {
    version: 'v1.0',
    createSurface: {
      surfaceId,
      catalogId: CATALOG_ID,
      metadata: layoutMetadata(slot),
      components: [{id: RENDERER_ROOT_ID, ...rootComponent}],
    },
  };
}

function rootStateMessage(surfaceId: string, value: unknown): SurfaceMessage {
  return {version: 'v1.0', updateDataModel: {surfaceId, path: statePath(RENDERER_ROOT_ID), value}};
}

function deleteSurfaceMessage(surfaceId: string): SurfaceMessage {
  return {version: 'v1.0', deleteSurface: {surfaceId}};
}

interface TurnEnvelopeOptions {
  sessionId: string;
  runId: string;
  middleEvents: ConverseEvent[];
}

/** Wraps a turn's events in the lifecycle events, carrying the session's own id. */
function storefrontTurn({sessionId, runId, middleEvents}: TurnEnvelopeOptions): ConverseEvent[] {
  return [
    TurnStarted({conversationSessionId: sessionId}),
    RunStarted({runId, threadId: sessionId}),
    ...middleEvents,
    RunFinished({runId, threadId: sessionId}),
    TurnComplete({conversationSessionId: sessionId}),
  ];
}

const ALL_PRODUCTS = [...lifeJacketsState.products, ...safetyGearState.products];

/**
 * Query completions offered by the shell. The assistant scenarios of the `/schema` route are
 * included so a completion opens a page the mock can answer.
 */
const COMPLETIONS = [
  'boating safety',
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'i like cold-water surfing. compare wetsuits for it',
  'tell me more about the thermoflex winter wetsuit',
  'life jackets',
  'life jackets for kids',
  'safety vests',
  'safety helmets',
  'kayak life jackets',
  'buoys',
];

const MAX_COMPLETIONS = 5;
const MAX_PRODUCT_SUGGESTIONS = 4;

/** The `QuerySuggestions` state for one query: completions and products matching every word. */
function suggestionsFor(query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (text: string) => words.every((word) => text.toLowerCase().includes(word));
  return {
    query,
    completions: COMPLETIONS.filter(matches)
      .slice(0, MAX_COMPLETIONS)
      .map((expression) => ({expression})),
    products: ALL_PRODUCTS.filter((product) => matches(product.ec_name)).slice(
      0,
      MAX_PRODUCT_SUGGESTIONS
    ),
  };
}

const HOME_CAROUSELS = [
  {heading: 'Trending on the water', products: lifeJacketsState.products.slice(0, 8)},
  {heading: 'Recommended for you', products: safetyGearState.products},
];

export {
  ALL_PRODUCTS,
  HOME_CAROUSELS,
  LAYOUT_EXTENSION,
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
};
export type {LayoutSlot, StorefrontContext, SurfaceMessage};
