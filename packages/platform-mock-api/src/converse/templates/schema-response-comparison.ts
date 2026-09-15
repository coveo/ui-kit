import {
  CATALOG_ID,
  buildConversationResponse,
  buildValidatedSurface,
  type A2uiComponentNode,
} from './shared.js';
import {
  ActivitySnapshot,
  StateSnapshot,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-comparison-462287cc';

const COMPARISON_ROOT_ID = 'comparison-root';

// The comparison surface is a single leaf node: the comparison-table owns its heading, AI
// summary, compared products, and attribute descriptors in AG-UI state (keyed by componentId).
// The node's `componentId` equals its `id` so AG-UI state correlates to the node.
const COMPARISON_SURFACE_NODES: A2uiComponentNode[] = [
  {
    id: COMPARISON_ROOT_ID,
    component: 'ComparisonTable',
    props: {componentId: COMPARISON_ROOT_ID, componentType: 'comparison-table'},
  },
];

function buildValidatedComparisonSurface(
  rootId: string,
  nodes: A2uiComponentNode[]
): Record<string, unknown> {
  return buildValidatedSurface({
    templateName: 'Mock_Comparison_Template',
    surfaceId: 'comparison-surface',
    rootId,
    nodes,
  });
}

const comparisonSurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-comparison-table',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: buildValidatedComparisonSurface(
          COMPARISON_ROOT_ID,
          COMPARISON_SURFACE_NODES
        ),
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
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'next-actions-surface',
          rootId: 'root',
          catalogId: CATALOG_ID,
          components: [
            {
              id: 'root',
              component: 'NextActionsBar',
              props: {
                componentId: 'next-actions-root',
                componentType: 'next-actions-bar',
              },
            },
          ],
        },
      },
    ],
  },
});

const comparisonStateComponents: Record<string, unknown> = {
  'comparison-root': {
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
  },
  'next-actions-root': {
    actions: [
      {text: 'Add ThermoFlex Winter Wetsuit to cart', type: 'followup'},
      {text: 'View more cold-water wetsuits', type: 'followup'},
      {text: 'Compare sizing guides', type: 'followup'},
    ],
  },
};

const stateSnapshot: ConverseEvent = StateSnapshot({components: comparisonStateComponents});

const middleEvents: ConverseEvent[] = [
  ...toolCall({
    toolCallId: 'tc-route-comparison',
    toolCallName: 'route_comparison',
    parentMessageId: 'msg-comparison-table',
    args: {intent: 'comparison', query: 'cold-water surfing wetsuits'},
    resultMessageId: 'tc-route-comparison-result',
    resultContent: '"Routed to comparison flow."',
  }),
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
  {...stateSnapshot, delayMs: 50},
  {...nextActionsSurfaceActivity, delayMs: 800},
];

const schemaComparisonEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaComparisonEvents};
