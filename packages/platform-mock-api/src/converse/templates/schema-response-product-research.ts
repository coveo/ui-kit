import {
  CATALOG_ID,
  RENDERER_ROOT_ID,
  bindStateFields,
  buildConversationResponse,
  buildValidatedSurface,
  statePath,
  type A2uiComponentNode,
} from './shared.js';
import {
  ActivitySnapshot,
  UpdateDataModelActivity,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-research-7f3a91c2';

const RESEARCH_SURFACE_ID = 'product-research-surface';
const RESEARCH_ROOT_ID = RENDERER_ROOT_ID;
const NEXT_ACTIONS_SURFACE_ID = 'next-actions-surface';
const NEXT_ACTIONS_ROOT_ID = RENDERER_ROOT_ID;

// The research surface is a single read-only leaf node: the product-research-card owns its product,
// research summary, and product-education bullets as Component_State, bound to `{ path }` objects at
// `/state/root/<field>`.
const RESEARCH_SURFACE_NODES: A2uiComponentNode[] = [
  {
    id: RESEARCH_ROOT_ID,
    component: 'ProductResearchCard',
    ...bindStateFields(RESEARCH_ROOT_ID, ['product', 'summary', 'bullets']),
  },
];

const researchSurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-product-research-card',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: buildValidatedSurface({
          templateName: 'Mock_Product_Research_Template',
          surfaceId: RESEARCH_SURFACE_ID,
          nodes: RESEARCH_SURFACE_NODES,
        }),
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

const THERMOFLEX_IMAGE =
  'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/8c6d80ac5b9b_bottom_left_852e0a5c-9b08-43bd-a6e5-67ec90d5d6f2.webp?v=1766164226';

// Knowledge references cited by the Markdown RichText examples below. A citation is the Markdown
// link `[cited text](ref:<permanentId>)`; the renderer resolves it to the reference's clickUri.
const careGuide = {
  kind: 'knowledge',
  permanentId: 'thermoflex-care-guide',
  title: 'ThermoFlex Care & Fit Guide',
  fileType: 'PDF',
  type: 'care_guide',
  size: 456123,
  clickUri: 'https://example.com/docs/thermoflex-care-and-fit-guide.pdf',
};

const warrantyTerms = {
  kind: 'knowledge',
  permanentId: 'thermoflex-warranty',
  title: 'Warranty Terms',
  fileType: 'HTML',
  type: 'warranty',
  clickUri: 'https://example.com/docs/thermoflex-warranty',
};

// Conforms to the thermidor-schema ProductResearchCardState: a schema `Product`, a non-empty
// summary, and a non-empty list of non-empty bullets.
const productResearchCardState = {
  product: {
    permanentid: 'gid://shopify/ProductVariant/50674633900306',
    ec_name: 'ThermoFlex Winter Wetsuit - Red / M',
    ec_brand: 'Rip Curl',
    ec_description:
      'A 7mm full wetsuit with a sealed back zip and glued, blindstitched seams, built to keep paddlers and surfers warm in the coldest waters.',
    ec_category: [
      'Sporting Goods',
      'Sporting Goods|Outdoor Recreation',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Wetsuits & Drysuits',
    ],
    ec_price: 399.99,
    ec_images: [THERMOFLEX_IMAGE],
    ec_thumbnails: [THERMOFLEX_IMAGE],
    ec_in_stock: true,
    ec_rating: 3.6,
    ec_color: 'Red',
    ec_item_group_id: '9961234500001',
    clickUri: 'https://barca-sports.myshopify.com/products/thermoflex-winter-wetsuit',
    additionalFields: {},
  },
  summary:
    'The ThermoFlex Winter Wetsuit is Rip Curl’s warmest option at Barca Sports. Its 7mm neoprene and sealed zip are made for extended sessions in water below 10°C. The extra thickness costs some flexibility, so it suits riders who put warmth ahead of freedom of movement.',
  bullets: [
    // Plain string: an uncited claim.
    '7mm neoprene gives maximum insulation for water between 4°C and 10°C.',
    // The whole claim is cited.
    {
      markdown:
        '[The sealed back zip and glued, blindstitched seams keep flushing to a minimum.](ref:thermoflex-care-guide)',
      references: [careGuide],
    },
    // Only part of the sentence is cited.
    {
      markdown:
        'It is stiffer than 4/3mm and 5/4mm suits, so expect a [short break-in period](ref:thermoflex-care-guide).',
      references: [careGuide],
    },
    {
      markdown:
        'Covered by a [3-year warranty](ref:thermoflex-warranty) against seam and zip defects.',
      references: [warrantyTerms],
    },
  ],
};

const nextActionsState = {
  suggestedActions: [
    {text: 'Add ThermoFlex Winter Wetsuit to cart', type: 'followup'},
    {text: 'Compare with other cold-water wetsuits', type: 'followup'},
    {text: 'Show the ThermoFlex sizing guide', type: 'followup'},
  ],
};

const researchStateActivity: ConverseEvent = UpdateDataModelActivity({
  messageId: 'activity-product-research-card-state',
  ops: [
    {
      surfaceId: RESEARCH_SURFACE_ID,
      path: statePath(RESEARCH_ROOT_ID),
      value: productResearchCardState,
    },
  ],
});

const nextActionsStateActivity: ConverseEvent = UpdateDataModelActivity({
  messageId: 'activity-research-next-actions-state',
  ops: [
    {
      surfaceId: NEXT_ACTIONS_SURFACE_ID,
      path: statePath(NEXT_ACTIONS_ROOT_ID),
      value: nextActionsState,
    },
  ],
});

const middleEvents: ConverseEvent[] = [
  ...toolCall({
    toolCallId: 'tc-route-research',
    toolCallName: 'route_research',
    parentMessageId: 'msg-product-research',
    args: {intent: 'research_single', query: 'thermoflex winter wetsuit'},
    resultMessageId: 'tc-route-research-result',
    resultContent: '"Routed to single-product research flow."',
  }),
  ...toolCall({
    toolCallId: 'tc-store-render-plan',
    toolCallName: 'store_render_plan',
    parentMessageId: 'msg-product-research',
    args: {route: 'research'},
    resultMessageId: 'tc-store-render-plan-result',
    resultContent: '"Stored render plan for route \'research\' with 1 product."',
  }),
  ...textMessage(
    'msg-product-research',
    'Here is what you should know about the ThermoFlex Winter Wetsuit ($399.99). It is the warmest suit in the range, made for very cold water, and it trades some flexibility for that insulation.'
  ),
  {...researchSurfaceActivity, delayMs: 2500},
  {...researchStateActivity, delayMs: 50},
  {...nextActionsSurfaceActivity, delayMs: 800},
  {...nextActionsStateActivity, delayMs: 50},
];

const schemaProductResearchEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaProductResearchEvents};
