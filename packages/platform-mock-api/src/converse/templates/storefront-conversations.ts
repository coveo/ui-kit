import {
  CATALOG_ID,
  RENDERER_ROOT_ID,
  bindStateFields,
  buildConversationResponse,
  statePath,
} from './shared.js';
import {waterSportsProductsUnder, type WaterSportsProduct} from './schema-response-search.js';
import {
  ActivitySnapshot,
  UpdateDataModelActivity,
  reasoningMessage,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

/**
 * More Shopping Assistant answers for the Storefront Preview, built from the Barca Sports catalog
 * the search mock serves. Each scenario answers with text, then product carousels, an optional
 * comparison table and next actions, as the agent would.
 */

interface Carousel {
  heading: string;
  products: WaterSportsProduct[];
}

interface Comparison {
  heading: string;
  summary: string;
  products: WaterSportsProduct[];
  /** One line per product, by product name, for the "Best for" row. */
  bestFor: Record<string, string>;
}

interface Scenario {
  id: string;
  /** Matches a prompt, lowercased. */
  pattern: RegExp;
  /** What the agent explains before it searches, then once it has the results. */
  reasoning: [before: string, after: string];
  text: string;
  carousels?: Carousel[];
  comparison?: Comparison;
  nextActions: string[];
  /**
   * A next action that opens a search: the agent attaches the search to a `searchOption` item, and
   * the server keeps it and opens it as a search surface when the shopper picks it.
   */
  browse?: {text: string; query: string};
}

function byName(...names: string[]): WaterSportsProduct[] {
  const all = waterSportsProductsUnder();
  return names.flatMap((name) => all.filter((product) => product.ec_name === name));
}

function under(maxPrice: number, ...relativePath: string[]): WaterSportsProduct[] {
  return waterSportsProductsUnder(...relativePath).filter(
    (product) => product.ec_price <= maxPrice
  );
}

const SCENARIOS: Scenario[] = [
  {
    id: 'wetsuit-snorkel',
    reasoning: [
      "The shopper is asking about warm water, so a full wetsuit would be too much. I'll look for spring and sleeveless suits, and keep the junior suit in case it's for a kid.",
      "Three suits fit. I'll show them in one carousel and point to the cold-water comparison as a next step.",
    ],
    pattern: /wetsuit to snorkel|warm water|spring suit|summer/,
    text: 'In warm water you rarely need a full wetsuit. A spring suit or a sleeveless suit keeps you warm enough for an hour of snorkeling or surfing and protects you from the sun.',
    carousels: [
      {
        heading: 'Warm-water wetsuits',
        products: byName(
          'SunSeeker Spring Wetsuit',
          'HydroLite Sleeveless Wetsuit',
          'TideRunner Junior Wetsuit'
        ),
      },
    ],
    nextActions: [
      'I like cold-water surfing. Compare wetsuits for it',
      'Show me snorkeling gear',
      'Gift ideas under $50',
    ],
  },
  {
    id: 'kayaks',
    reasoning: [
      "A beginner kayaker needs stability more than speed. I'll search the Kayaks category first.",
      "The sit-on-top RiverRun is the most stable. A paddle and a life jacket are required on most lakes, so I'll add a second carousel with those.",
    ],
    pattern: /kayak|canoe|paddles?\b|paddling/,
    text: "For a first kayak, a sit-on-top is the easiest to get in and out of and very stable on calm water. The RiverRun is my pick to start; the LakeGlide tracks better if you plan longer outings. Don't forget a paddle and a life jacket: both are required on most lakes.",
    carousels: [
      {heading: 'Kayaks', products: waterSportsProductsUnder('Paddling', 'Kayaks')},
      {
        heading: 'Paddles and life jackets',
        products: [
          ...waterSportsProductsUnder('Paddling', 'Paddles'),
          ...waterSportsProductsUnder('Paddling', 'Life Jackets'),
        ],
      },
    ],
    browse: {text: 'See all kayaks', query: 'kayak'},
    nextActions: ['Compare the kayaks side by side', 'Show me canoes instead', 'Kayaks under $600'],
  },
  {
    id: 'accessories',
    reasoning: [
      "A new surfboard needs wax or a traction pad, a leash and a bag. I'll search Water Sports Accessories.",
      "I'll group the must-haves (wax, leash, traction pad, comb) apart from the board bags, which protect the board in transit.",
    ],
    pattern: /accessor|wax|leash|board bag|traction/,
    text: 'A new board needs three things before its first session: wax (or a traction pad on a shortboard), a leash about as long as the board, and a bag to keep it safe in the car. A wax comb keeps the wax grippy.',
    carousels: [
      {
        heading: 'Must-haves',
        products: byName(
          'StickyGrip Surf Wax',
          'CompLeash Surf Leash',
          'GripMax Traction Pad',
          'ScrapePro Wax Comb'
        ),
      },
      {
        heading: 'Protect your board',
        products: waterSportsProductsUnder('Water Sports Accessories', 'Board Bags'),
      },
    ],
    nextActions: ['Which leash length do I need?', 'Show me surfboards', 'Gift ideas under $50'],
  },
  {
    id: 'surfboards',
    reasoning: [
      "The shopper wants to compare surfboards. I'll search the Surfboards category.",
      "There are four boards for very different levels. A comparison table with a 'best for' row will help more than a carousel.",
    ],
    pattern: /surfboard|shortboard|longboard|board for/,
    text: 'Here are our four surfboards. The FunFish foam board forgives mistakes and is the best way to learn; the GlideMax longboard catches small waves easily; the WaveRider and ProCarve are for surfers who already turn on the face of the wave.',
    comparison: {
      heading: 'Surfboards compared',
      summary:
        'Pick by level: the foam FunFish for your first season, the GlideMax for easy small-wave days, the ProCarve or WaveRider once you can turn reliably.',
      products: waterSportsProductsUnder('Surfing', 'Surfboards'),
      bestFor: {
        'WaveRider Shortboard Surfboard': 'Advanced surfers in punchy waves',
        'GlideMax Longboard Surfboard': 'Cruising and small, slow waves',
        'FunFish Foam Surfboard': 'Beginners and kids',
        'ProCarve Performance Surfboard': 'Intermediate surfers progressing',
      },
    },
    browse: {text: 'See all surfboards', query: 'surfboard'},
    nextActions: [
      'What accessories do I need for my new surfboard?',
      'Show me wetsuits',
      'Build a beginner surfing kit with budget, mid-range, and premium options',
    ],
  },
  {
    id: 'snorkeling',
    reasoning: [
      "Snorkeling needs a mask, a snorkel and fins; diving adds a computer. I'll search each Snorkeling & Diving category.",
      "I'll show masks and snorkels together, fins apart, and dive computers last since only divers need them.",
    ],
    pattern: /snorkel|diving|dive|mask|fins?\b/,
    text: 'To snorkel you need a mask, a snorkel and fins. A dry-top snorkel keeps water out when waves splash over it, and open-heel fins fit over booties if the water is cold. If you plan to scuba dive, a dive computer tracks your depth and time.',
    carousels: [
      {
        heading: 'Masks and snorkels',
        products: [
          ...waterSportsProductsUnder('Snorkeling & Diving', 'Masks'),
          ...waterSportsProductsUnder('Snorkeling & Diving', 'Snorkels'),
        ],
      },
      {heading: 'Fins', products: waterSportsProductsUnder('Snorkeling & Diving', 'Fins')},
      {
        heading: 'Dive computers',
        products: waterSportsProductsUnder('Snorkeling & Diving', 'Dive Computers'),
      },
    ],
    browse: {text: 'See all snorkeling gear', query: 'snorkel'},
    nextActions: [
      'Compare the dive computers',
      'Snorkeling gear under $100',
      'Do I need a wetsuit to snorkel?',
    ],
  },
  {
    id: 'paddleboards',
    reasoning: [
      "Paddleboarding on a lake means flat water, so stability and storage matter most. I'll search the stand-up paddleboards.",
      'Three boards: one inflatable, one stable, one fast. A comparison table makes the trade-off clear.',
    ],
    pattern: /\bsup\b|paddleboard|stand.?up/,
    text: 'For a lake, any of these three will do. The InflateEasy rolls into a backpack, which helps if you have a small car; the CalmWater is the most stable for beginners; the TouringPro is long and fast for distance.',
    comparison: {
      heading: 'Stand-up paddleboards compared',
      summary:
        'Inflatable for storage and travel, the CalmWater for stability, the TouringPro for speed over long distances.',
      products: waterSportsProductsUnder('Surfing', 'Stand-Up Paddleboards'),
      bestFor: {
        'CalmWater SUP Paddleboard': 'First-timers on flat water',
        'TouringPro SUP Paddleboard': 'Long tours and fitness',
        'InflateEasy SUP Paddleboard': 'Small cars and travel',
      },
    },
    nextActions: [
      'Show me paddles',
      'Which life jacket for paddleboarding?',
      'Paddleboards under $500',
    ],
  },
  {
    id: 'gifts',
    reasoning: [
      "The budget is $50. I'll filter the whole catalog by price.",
      "I'll keep the items most water lovers use, like dry bags, leashes, wax and snorkels.",
    ],
    pattern: /gift|present|under \$?50|cheap|budget/,
    text: 'Here are a few things under $50 every water lover uses: a dry bag for the beach, a fresh leash, surf wax, or a snorkel set.',
    carousels: [{heading: 'Gifts under $50', products: under(50)}],
    nextActions: [
      'Gifts under $100',
      'Show me snorkeling gear',
      'What accessories do I need for my new surfboard?',
    ],
  },
];

const NEXT_ACTIONS_SURFACE_ID = 'next-actions-surface';

function toCarouselProduct(product: WaterSportsProduct) {
  const {children: _children, ...rest} = product;
  return rest;
}

function surface(
  messageId: string,
  surfaceId: string,
  component: string,
  fields: string[]
): ConverseEvent {
  return ActivitySnapshot({
    messageId,
    activityType: 'a2ui-surface',
    replace: true,
    content: {
      messages: [
        {
          version: 'v1.0',
          createSurface: {
            surfaceId,
            catalogId: CATALOG_ID,
            components: [
              {id: RENDERER_ROOT_ID, component, ...bindStateFields(RENDERER_ROOT_ID, fields)},
            ],
          },
        },
      ],
    },
  });
}

function state(messageId: string, surfaceId: string, value: unknown): ConverseEvent {
  return UpdateDataModelActivity({
    messageId,
    ops: [{surfaceId, path: statePath(RENDERER_ROOT_ID), value}],
  });
}

function comparisonState({heading, summary, products, bestFor}: Comparison) {
  return {
    heading,
    summary,
    products: products.map((product) => ({
      productId: product.permanentid,
      name: product.ec_name,
      imageUrl: product.ec_images[0],
      price: product.ec_price,
      rating: product.ec_rating,
      values: {
        brand: product.ec_brand,
        color: product.ec_color,
        bestFor: bestFor[product.ec_name] ?? '',
      },
    })),
    attributes: [
      {key: 'brand', label: 'Brand'},
      {key: 'color', label: 'Color'},
      {key: 'bestFor', label: 'Best for'},
    ],
  };
}

// The real agent's tools (agent-smith) answer in compact text: a category list, a TOON list of
// suggestions, a TOON table of products, and one line per rendered surface.

/** A product's category path below the shared "Sporting Goods" root chain, e.g. "Paddling|Kayaks". */
function categoryPath(product: WaterSportsProduct): string {
  const deepest = product.ec_category.at(-1) ?? '';
  return deepest.split('|').slice(3).join('|');
}

function catalogFacetsResult(products: WaterSportsProduct[]): string {
  const counts = new Map<string, number>();
  for (const product of products) {
    const path = categoryPath(product);
    counts.set(path, (counts.get(path) ?? 0) + 1);
  }
  const brands = [...new Set(products.map((product) => product.ec_brand))];
  return [
    'Available categories (ec_category):',
    ...[...counts].map(([path, count]) => `- ${path} (${count})`),
    '',
    `Available brands (ec_brand): ${brands.join(', ')}`,
  ].join('\n');
}

function suggestResult(products: WaterSportsProduct[]): string {
  const expressions = [...new Set(products.map((product) => product.ec_name.toLowerCase()))].slice(
    0,
    3
  );
  return expressions.length
    ? `[${expressions.length}]: ${expressions.join(',')}`
    : 'No suggestions found.';
}

function searchResult(products: WaterSportsProduct[]): string {
  if (products.length === 0) {
    return 'No products found.';
  }
  return [
    `products[${products.length}]{permanentid,ec_name,ec_price}:`,
    ...products.map((product) => `  ${product.permanentid},${product.ec_name},${product.ec_price}`),
  ].join('\n');
}

function commonCategory(products: WaterSportsProduct[]): string {
  const paths = products.map(categoryPath).map((path) => path.split('|'));
  const shared: string[] = [];
  for (const [index, segment] of (paths[0] ?? []).entries()) {
    if (paths.every((path) => path[index] === segment)) {
      shared.push(segment);
    } else {
      break;
    }
  }
  return shared.join('|');
}

function buildScenarioEvents(scenario: Scenario, prompt: string): ConverseEvent[] {
  const messageId = `msg-storefront-${scenario.id}`;
  let toolCallCount = 0;
  const call = (toolCallName: string, args: Record<string, unknown>, result: string) => {
    toolCallCount += 1;
    const toolCallId = `tc-${scenario.id}-${toolCallCount}`;
    return toolCall({
      toolCallId,
      toolCallName,
      parentMessageId: messageId,
      args,
      resultMessageId: `${toolCallId}-result`,
      resultContent: JSON.stringify(result),
    }).map((event) => ({...event, delayMs: 120}));
  };
  const think = (index: number, text: string) =>
    reasoningMessage(`${messageId}-reasoning-${index}`, text).map((event) => ({
      ...event,
      delayMs: 45,
    }));

  // What the answer shows, each with the search that found it.
  const searches = [
    ...(scenario.carousels ?? []).map(({heading, products}) => ({heading, products})),
    ...(scenario.comparison
      ? [{heading: scenario.comparison.heading, products: scenario.comparison.products}]
      : []),
  ];
  const everything = searches.flatMap(({products}) => products);
  const query = prompt.trim().toLowerCase();

  const middleEvents: ConverseEvent[] = [
    ...think(1, scenario.reasoning[0]),
    ...call('coveo_commerce_catalog_facets', {query}, catalogFacetsResult(everything)),
    ...call('coveo_query_suggest', {query, count: 3}, suggestResult(everything)),
    ...think(2, 'Let me search each category I found:'),
    ...searches.flatMap(({heading, products}) => {
      const category = commonCategory(products);
      return call(
        'coveo_commerce_search',
        {query: heading.toLowerCase(), per_page: 20, ...(category ? {facets: category} : {})},
        searchResult(products)
      );
    }),
    ...think(3, scenario.reasoning[1]),
    ...textMessage(messageId, scenario.text),
  ];

  (scenario.carousels ?? []).forEach((carousel, index) => {
    const surfaceId = `product-surface-${scenario.id}-${index}`;
    middleEvents.push(
      ...call(
        'render_product_carousel',
        {
          surface_id: surfaceId,
          heading: carousel.heading,
          products: carousel.products.map((product) => product.permanentid),
        },
        `ProductCarousel '${carousel.heading}' rendered on surface '${surfaceId}'.`
      ),
      {
        ...surface(`activity-${surfaceId}`, surfaceId, 'ProductCarousel', ['heading', 'products']),
        delayMs: 300,
      },
      {
        ...state(`activity-${surfaceId}-state`, surfaceId, {
          heading: carousel.heading,
          products: carousel.products.map(toCarouselProduct),
        }),
        delayMs: 50,
      }
    );
  });
  if (scenario.comparison) {
    const surfaceId = `comparison-surface-${scenario.id}`;
    middleEvents.push(
      ...call(
        'render_comparison_table',
        {
          surface_id: surfaceId,
          heading: scenario.comparison.heading,
          products: scenario.comparison.products.map((product) => product.permanentid),
        },
        `ComparisonTable '${scenario.comparison.heading}' rendered on surface '${surfaceId}'.`
      ),
      {
        ...surface(`activity-${surfaceId}`, surfaceId, 'ComparisonTable', [
          'heading',
          'summary',
          'products',
          'attributes',
        ]),
        delayMs: 300,
      },
      {
        ...state(`activity-${surfaceId}-state`, surfaceId, comparisonState(scenario.comparison)),
        delayMs: 50,
      }
    );
  }
  const actions: Record<string, unknown>[] = scenario.nextActions.map((text) => ({
    text,
    type: 'followup',
  }));
  if (scenario.browse) {
    actions.push({
      text: scenario.browse.text,
      type: 'searchOption',
      optionId: `opt-${crypto.randomUUID()}`,
      search: {query: scenario.browse.query},
    });
  }
  middleEvents.push(
    ...call(
      'render_next_actions',
      // The server keeps each option's search; the client never sees it, not even in tool calls.
      {actions: actions.map(({search: _search, ...action}) => action)},
      `NextActionsBar rendered on surface '${NEXT_ACTIONS_SURFACE_ID}'.`
    ),
    {
      ...surface('activity-next-actions', NEXT_ACTIONS_SURFACE_ID, 'NextActionsBar', [
        'suggestedActions',
      ]),
      delayMs: 300,
    },
    {
      ...state('activity-next-actions-state', NEXT_ACTIONS_SURFACE_ID, {suggestedActions: actions}),
      delayMs: 50,
    }
  );
  return buildConversationResponse({
    runId: `storefront-${scenario.id}`,
    middleEvents,
    includeInitialStateSnapshot: false,
    includeFinalStateSnapshot: false,
  });
}

/** The scenario answering `prompt`, or undefined when none matches. */
function matchStorefrontConversation(prompt: string): ConverseEvent[] | undefined {
  const normalized = prompt.trim().toLowerCase();
  const scenario = SCENARIOS.find(({pattern}) => pattern.test(normalized));
  return scenario ? buildScenarioEvents(scenario, prompt) : undefined;
}

export {matchStorefrontConversation};
