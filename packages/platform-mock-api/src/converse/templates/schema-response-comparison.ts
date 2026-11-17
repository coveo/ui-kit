import {
  CATALOG_ID,
  RENDERER_ROOT_ID,
  bindStateFields,
  buildConversationResponse,
  buildValidatedSurface,
  statePath,
  type A2uiComponentNode,
  deleteSurfaceMessage,
  loadingSurfaceMessage,
} from './shared.js';
import {
  ActivitySnapshot,
  UpdateDataModelActivity,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-comparison-462287cc';

const COMPARISON_SURFACE_ID = 'comparison-surface';
const COMPARISON_ROOT_ID = RENDERER_ROOT_ID;
const NEXT_ACTIONS_SURFACE_ID = 'next-actions-surface';
const PLACEHOLDER_COMPARISON_SURFACE_ID = `placeholder-${runId}-comparison`;
const PLACEHOLDER_NEXT_ACTIONS_SURFACE_ID = `placeholder-${runId}-next-actions`;
const NEXT_ACTIONS_ROOT_ID = RENDERER_ROOT_ID;

// The comparison surface is a single leaf node: the comparison-table owns its heading, AI summary,
// compared products, and attribute descriptors as Component_State, bound to `{ path }` objects at
// `/state/root/<field>`. Each product carries its own `relatedDocuments`, so they ride on the
// `products` binding.
const COMPARISON_SURFACE_NODES: A2uiComponentNode[] = [
  {
    id: COMPARISON_ROOT_ID,
    component: 'ComparisonTable',
    ...bindStateFields(COMPARISON_ROOT_ID, ['heading', 'summary', 'products', 'attributes']),
  },
];

function buildValidatedComparisonSurface(nodes: A2uiComponentNode[]): Record<string, unknown> {
  return buildValidatedSurface({
    templateName: 'Mock_Comparison_Template',
    surfaceId: COMPARISON_SURFACE_ID,
    nodes,
  });
}

const comparisonSurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-comparison-table',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      deleteSurfaceMessage(PLACEHOLDER_COMPARISON_SURFACE_ID),
      {
        version: 'v1.0',
        createSurface: buildValidatedComparisonSurface(COMPARISON_SURFACE_NODES),
      },
    ],
  },
});

const nextActionsSurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-next-actions',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      deleteSurfaceMessage(PLACEHOLDER_NEXT_ACTIONS_SURFACE_ID),
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: NEXT_ACTIONS_SURFACE_ID,
          catalogId: CATALOG_ID,
          components: [
            {
              id: NEXT_ACTIONS_ROOT_ID,
              component: 'NextActionsBar',
              ...bindStateFields(NEXT_ACTIONS_ROOT_ID, ['suggestedActions']),
            },
          ],
        },
      },
    ],
  },
});

const comparisonTableState = {
  heading: 'Cold-Water Surfing Wetsuits Comparison',
  summary:
    "All three wetsuits excel at cold-water protection with premium seam construction and 3-year warranties. ThermoFlex stands out with 7mm thickness for extreme conditions, while both O'Neill options use sustainable materials and offer excellent flexibility. Choose ThermoFlex for maximum warmth in the coldest waters, ZenSurf for proven durability and ratings, or EcoWave for sustainability and UV protection.",
  products: [
    {
      productId: 'gid://shopify/ProductVariant/50674633900306',
      name: 'ThermoFlex Winter Wetsuit - Red / M',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/8c6d80ac5b9b_bottom_left_852e0a5c-9b08-43bd-a6e5-67ec90d5d6f2.webp?v=1766164226',
      price: 399.99,
      rating: 3.6,
      values: {
        brand: 'Rip Curl',
        standout: '7mm thickness with sealed zip provides maximum insulation for extreme cold',
        tradeOff: 'Premium price point at $399.99',
        bestFor: 'Serious cold-water paddleboarders seeking peak thermal performance',
      },
      relatedDocuments: [
        {
          title: 'ThermoFlex Winter Wetsuit Owner Manual',
          clickUri: 'https://barca-sports.myshopify.com/cdn/shop/files/thermoflex-owner-manual.pdf',
          filetype: 'pdf',
          size: 2480000,
        },
        {
          title: 'ThermoFlex Sizing Guide',
          clickUri: 'https://barca-sports.myshopify.com/cdn/shop/files/thermoflex-sizing-guide.pdf',
          filetype: 'pdf',
          size: 812300,
        },
        {
          title: 'Wetsuit Care and Storage',
          clickUri: 'https://barca-sports.myshopify.com/pages/wetsuit-care',
          filetype: 'html',
          size: 18400,
        },
        {
          title: 'ThermoFlex Warranty Terms',
          clickUri: 'https://barca-sports.myshopify.com/cdn/shop/files/thermoflex-warranty.pdf',
          filetype: 'pdf',
          size: 156900,
        },
        {
          title: 'Cold-Water Surfing Safety Checklist',
          clickUri: 'https://barca-sports.myshopify.com/pages/cold-water-safety',
          filetype: 'html',
          size: 24600,
        },
        {
          title: 'ThermoFlex Seam Repair Guide',
          clickUri: 'https://barca-sports.myshopify.com/cdn/shop/files/thermoflex-seam-repair.pdf',
          filetype: 'pdf',
          size: 1048000,
        },
      ],
    },
    {
      productId: 'gid://shopify/ProductVariant/50674625773842',
      name: 'ZenSurf Full Suit - Red / L',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/8d486fbcd37e_bottom_right_9f239b34-f80a-43d9-8d3a-4db4185b6ce3.webp?v=1766164198',
      price: 299.99,
      rating: 4.5,
      values: {
        brand: "O'Neill",
        standout: 'Sustainable neoprene with blindstitched seams and highest rating (4.5)',
        tradeOff:
          'Designed primarily for paddleboarders, may have different fit for dedicated surfers',
        bestFor: 'Eco-conscious surfers wanting proven reliability',
      },
      relatedDocuments: [
        {
          title: 'ZenSurf Full Suit Owner Manual',
          clickUri: 'https://barca-sports.myshopify.com/cdn/shop/files/zensurf-owner-manual.pdf',
          filetype: 'pdf',
          size: 1920000,
        },
        {
          title: 'ZenSurf Sizing Guide',
          clickUri: 'https://barca-sports.myshopify.com/cdn/shop/files/zensurf-sizing-guide.pdf',
          filetype: 'pdf',
          size: 640500,
        },
      ],
    },
    {
      productId: 'gid://shopify/ProductVariant/50674627838226',
      name: 'EcoWave Thermal Suit - Blue / S',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/041224485b64_top_left.webp?v=1766164210',
      price: 299.99,
      rating: 4.1,
      values: {
        brand: "O'Neill",
        standout: 'High-stretch neoprene with UV resistance and eco-friendly materials',
        tradeOff: 'Front zip (vs. back zip) requires different entry method',
        bestFor: 'Environmentally-minded surfers prioritizing flexibility and UV protection',
      },
    },
  ],
  attributes: [
    {key: 'brand', label: 'Brand'},
    {key: 'standout', label: 'Standout'},
    {key: 'tradeOff', label: 'Trade-off'},
    {key: 'bestFor', label: 'Best for'},
  ],
};

const nextActionsState = {
  suggestedActions: [
    {text: 'Add ThermoFlex Winter Wetsuit to cart', type: 'followup'},
    {text: 'View more cold-water wetsuits', type: 'followup'},
    {text: 'Compare sizing guides', type: 'followup'},
  ],
};

// The comparison-table state is written whole at `statePath('root')` on the comparison surface;
// the next-actions state at `statePath('root')` on the next-actions surface. Each op is emitted
// right after its surface is created.
const comparisonStateActivity: ConverseEvent = UpdateDataModelActivity({
  messageId: 'activity-comparison-table-state',
  ops: [
    {
      surfaceId: COMPARISON_SURFACE_ID,
      path: statePath(COMPARISON_ROOT_ID),
      value: comparisonTableState,
    },
  ],
});

const nextActionsStateActivity: ConverseEvent = UpdateDataModelActivity({
  messageId: 'activity-comparison-next-actions-state',
  ops: [
    {
      surfaceId: NEXT_ACTIONS_SURFACE_ID,
      path: statePath(NEXT_ACTIONS_ROOT_ID),
      value: nextActionsState,
    },
  ],
});

const comparisonPlaceholderActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-comparison-table',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [loadingSurfaceMessage(PLACEHOLDER_COMPARISON_SURFACE_ID, 'ComparisonTable')],
  },
});

const nextActionsPlaceholderActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-next-actions',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [loadingSurfaceMessage(PLACEHOLDER_NEXT_ACTIONS_SURFACE_ID, 'NextActionsBar')],
  },
});

const middleEvents: ConverseEvent[] = [
  ...toolCall({
    toolCallId: 'tc-route-comparison',
    toolCallName: 'route_comparison',
    parentMessageId: 'msg-comparison-table',
    args: {intent: 'comparison', query: 'cold-water surfing wetsuits'},
    resultMessageId: 'tc-route-comparison-result',
    resultContent: '"Routed to comparison flow."',
  }),
  {...comparisonPlaceholderActivity, delayMs: 300},
  ...toolCall({
    toolCallId: 'tc-store-render-plan',
    toolCallName: 'store_render_plan',
    parentMessageId: 'msg-comparison-table',
    args: {route: 'comparison'},
    resultMessageId: 'tc-store-render-plan-result',
    resultContent: '"Stored render plan for route \'comparison\' with 3 products."',
  }),
  ...textMessage(
    'msg-comparison-table',
    'Your cold-water wetsuit comparison is ready. ThermoFlex ($399.99) delivers maximum warmth with 7mm thickness for extreme conditions, while ZenSurf and EcoWave (both $299.99) offer excellent durability and sustainability with lighter flexibility—all backed by 3-year warranties and premium seams.'
  ),
  {...comparisonSurfaceActivity, delayMs: 2500},
  {...comparisonStateActivity, delayMs: 50},
  {...nextActionsPlaceholderActivity, delayMs: 100},
  {...nextActionsSurfaceActivity, delayMs: 800},
  {...nextActionsStateActivity, delayMs: 50},
];

const schemaComparisonEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaComparisonEvents};
