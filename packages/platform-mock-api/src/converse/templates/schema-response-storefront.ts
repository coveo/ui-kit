import {CATALOG_ID, RENDERER_ROOT_ID, statePath} from './shared.js';
import {lifeJacketsState, safetyGearState} from './schema-response-discovery.js';
import {waterSportsProductsUnder, type WaterSportsProduct} from './schema-response-search.js';
import {
  ActivitySnapshot,
  RunFinished,
  RunStarted,
  TurnComplete,
  TurnStarted,
  type ConverseEvent,
} from '../events.js';

/**
 * The Storefront Preview views a client names in `context.custom.surfaceId`, the field
 * agent-gateway's private route reads today. Each one names a view of the page, not an A2-UI
 * surface: the surfaces themselves get server-chosen `ui-<uuid>` ids.
 */
const STOREFRONT_CONTEXTS = {
  shell: 'storefront-preview',
  home: 'storefront-preview-home',
  assistant: 'storefront-preview-assistant',
} as const;

type StorefrontContext = (typeof STOREFRONT_CONTEXTS)[keyof typeof STOREFRONT_CONTEXTS];

/**
 * The public `@coveo/thermidor-schema` components each view may use. Declared here rather than
 * read from a schema document: the per-view membership is not part of the public schema.
 */
const STOREFRONT_COMPONENTS: Readonly<Record<StorefrontContext, readonly string[]>> = {
  [STOREFRONT_CONTEXTS.shell]: ['QuerySuggestions'],
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
  rootComponent: Record<string, unknown>
): SurfaceMessage {
  return {
    version: 'v1.0',
    createSurface: {
      surfaceId,
      catalogId: CATALOG_ID,
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

// Popular searches, plus every product, brand and category name of the search mock's catalog, so
// most prefixes complete to something real.
const POPULAR_SEARCHES = [
  'life jacket',
  'life jacket for kids',
  'wetsuit for cold water',
  'surfboard wax',
  'kayak paddle',
  'snorkel set',
  'boating safety',
  'water sports',
];

const MAX_COMPLETIONS = 6;
const MAX_PRODUCT_SUGGESTIONS = 4;

const catalogProducts = waterSportsProductsUnder();

/** A product's own category names, below the shared "Sporting Goods" root chain. */
function categoryNames(product: WaterSportsProduct): string[] {
  return product.ec_category
    .map((path) => path.split('|'))
    .filter((segments) => segments.length > 3)
    .map((segments) => segments.at(-1)!);
}

const completionCandidates = [
  ...new Set([
    ...POPULAR_SEARCHES,
    ...catalogProducts.flatMap((product) => [
      product.ec_name.toLowerCase(),
      product.ec_brand.toLowerCase(),
      ...categoryNames(product).map((name) => name.toLowerCase()),
    ]),
  ]),
];

/** Lower is better: a prefix match beats a word match beats a match anywhere; -1 is no match. */
function matchRank(text: string, needle: string): number {
  if (text.startsWith(needle)) {
    return 0;
  }
  if (text.split(/[\s&/-]+/).some((word) => word.startsWith(needle))) {
    return 1;
  }
  return text.includes(needle) ? 2 : -1;
}

interface SuggestionsState {
  query: string;
  completions: {expression: string; score: number}[];
  products: Omit<WaterSportsProduct, 'children'>[];
}

/** The `QuerySuggestions` state for one query: completions and products from the catalog. */
function suggestionsFor(query: string): SuggestionsState {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return {query, completions: [], products: []};
  }
  const completions = completionCandidates
    .map((expression) => ({expression, rank: matchRank(expression, needle)}))
    .filter(({rank}) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.expression.length - b.expression.length)
    .slice(0, MAX_COMPLETIONS)
    .map(({expression}, index) => ({expression, score: MAX_COMPLETIONS - index}));
  const products = catalogProducts
    .map((product) => ({
      product,
      rank: Math.min(
        ...[product.ec_name, product.ec_brand, ...categoryNames(product)]
          .map((text) => matchRank(text.toLowerCase(), needle))
          .map((rank) => (rank < 0 ? Infinity : rank))
      ),
    }))
    .filter(({rank}) => rank !== Infinity)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_PRODUCT_SUGGESTIONS)
    .map(({product: {children: _children, ...product}}) => product);
  return {query, completions, products};
}

const HOME_CAROUSELS = [
  {heading: 'Trending on the water', products: lifeJacketsState.products.slice(0, 8)},
  {heading: 'Recommended for you', products: safetyGearState.products},
];

export {
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
};
export type {StorefrontContext, SurfaceMessage};
