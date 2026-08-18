import {buildConversationResponse} from './shared.js';
import {
  ActivitySnapshot,
  StateSnapshot,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-discovery-d8d8e15c';

const PRODUCT_LIST_CONTROLLER_SCHEMA =
  'https://schema.thermidor.coveo.com/controllers/product-list.schema.json';
const NEXT_ACTIONS_CONTROLLER_SCHEMA =
  'https://schema.thermidor.coveo.com/controllers/next-actions.schema.json';
const CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

const carousel1SurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-carousel-life-jackets',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'product-surface-life-jackets',
          catalogId: CATALOG_ID,
          components: [
            {
              id: 'root',
              component: 'ProductCarousel',
              props: {
                controllers: {
                  productListController: {
                    controllerId: 'pl-life-jackets',
                    controllerSchema: PRODUCT_LIST_CONTROLLER_SCHEMA,
                  },
                },
                heading: 'Life Jackets',
              },
            },
          ],
        },
      },
    ],
  },
});

const carousel2SurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-carousel-safety-gear',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'product-surface-safety-gear',
          catalogId: CATALOG_ID,
          components: [
            {
              id: 'root',
              component: 'ProductCarousel',
              props: {
                controllers: {
                  productListController: {
                    controllerId: 'pl-safety-gear',
                    controllerSchema: PRODUCT_LIST_CONTROLLER_SCHEMA,
                  },
                },
                heading: 'Boating Safety Gear',
              },
            },
          ],
        },
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
          catalogId: CATALOG_ID,
          components: [
            {
              id: 'root',
              component: 'NextActionsBar',
              props: {
                controllers: {
                  nextActionsController: {
                    controllerId: 'next-actions-ctrl-1',
                    controllerSchema: NEXT_ACTIONS_CONTROLLER_SCHEMA,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
});

const stateSnapshot: ConverseEvent = StateSnapshot({
  controllers: {
    'pl-life-jackets': {
      products: [
        {permanentid: 'gid://shopify/ProductVariant/50681799147794', ec_name: 'AquaSecure Life Jacket - Yellow / Child', ec_shortdesc: 'Your ultimate companion for family water activities. Lightweight Type II life jacket with 15.5 lbs buoyancy.', ec_brand: "O'Neill", ec_price: 29.99, ec_promo_price: 29.99, ec_rating: 4.3, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/a7621e6658d4_bottom_right_29681cfc-e9ee-47fb-aa7d-1d0061ddf6b2.webp?v=1766163665'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681803047186', ec_name: 'AquaGuardian Life Jacket - Black / Toddler', ec_shortdesc: 'The ultimate safety companion for anglers. Inflatable Type III with 18 lbs buoyancy.', ec_brand: 'Mustang Survival', ec_price: 79.99, ec_promo_price: 79.99, ec_rating: 3.6, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/cf2bd6719aed_top_right.webp?v=1766163680'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681802260754', ec_name: 'AdventureGuard Life Jacket - Blue / Youth', ec_shortdesc: 'Unmatched safety and comfort for kayakers. Type III with 17 lbs buoyancy.', ec_brand: 'Onyx', ec_price: 69.99, ec_promo_price: 69.99, ec_rating: 4.9, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/5e0c51297428_top_left_bb56bd05-ccc0-4697-a9a8-fef450f1ad61.webp?v=1766163678'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681786433810', ec_name: 'RescueMaster Life Jacket - Black / Oversized', ec_shortdesc: 'Designed for offshore adventurers. Type I with maximum buoyancy and resilience.', ec_brand: 'Mustang Survival', ec_price: 129.99, ec_promo_price: 129.99, ec_rating: 4.6, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/327f704e9618_bottom_right.webp?v=1766163620'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681786859794', ec_name: 'SafeSea Pro Life Jacket - Youth', ec_shortdesc: 'Designed for fishermen. Commercial-grade Type I with 26 lbs buoyancy.', ec_brand: 'Kent', ec_price: 59.99, ec_promo_price: 59.99, ec_rating: 3.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/6354784d2d0d_top_left_96083e53-b664-4671-ab7c-98080e06ec5f.webp?v=1766163622'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681808650514', ec_name: 'RescueGuard Life Jacket - Orange / Custom', ec_shortdesc: 'Designed for emergency rescuers. Type IV high-visibility with 22 lbs buoyancy.', ec_brand: 'Stearns', ec_price: 39.99, ec_promo_price: 39.99, ec_rating: 3.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/b74ccfcba057_bottom_right_dd4460ed-0e5b-4d62-825b-9c1907021194.webp?v=1766163707'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681787351314', ec_name: 'Nautical Shield Life Jacket - Adjustable', ec_shortdesc: 'Meticulously designed for dedicated boaters. Type I Offshore with US Coast Guard Approval.', ec_brand: 'Stearns', ec_price: 99.99, ec_promo_price: 99.99, ec_rating: 3.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/31f20d8ad8e8_bottom_right.webp?v=1766163627'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681787089170', ec_name: 'Ocean Guardian Life jacket - Oversized', ec_shortdesc: 'Ultimate offshore safety. US Coast Guard approved with 30 lbs buoyancy.', ec_brand: 'Hardcore Water Sports', ec_price: 49.99, ec_promo_price: 49.99, ec_rating: 3.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/314149356bd7_top_left_5b190c21-1ea2-4c80-8db8-b34273398577.webp?v=1766163626'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681801736466', ec_name: 'AquaGuard Sport Life Jacket - Blue / Oversized', ec_shortdesc: 'Designed for swimmers. 15.5 lbs buoyancy with reflective panels and mesh materials.', ec_brand: 'Hardcore Water Sports', ec_price: 49.99, ec_promo_price: 49.99, ec_rating: 3.3, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/e6051cd90e8c_bottom_right_446cd525-4bbf-4ec4-98a3-e59f82170137.webp?v=1766163676'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681803440402', ec_name: 'Eclipse Hybrid Life Jacket - Black / Adjustable', ec_shortdesc: 'Safety and comfort for kayaking adventures. Type III with quick-release straps.', ec_brand: 'Onyx', ec_price: 69.99, ec_promo_price: 69.99, ec_rating: 4.9, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f88d8d76da45_bottom_left.webp?v=1766163682'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681800098066', ec_name: 'EcoGuard Adventure Life Jacket - Yellow / Child', ec_shortdesc: 'Ultimate safety companion for family water activities. Coast Guard Approved Type II.', ec_brand: 'Stearns', ec_price: 29.99, ec_promo_price: 29.99, ec_rating: 3.2, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/5401e9d0fb34_bottom_right.webp?v=1766163669'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681816940818', ec_name: 'KayakGuardian Inflatable Life Jacket - Green / Child', ec_shortdesc: 'Stay safe on kayaking adventures. Compact with 16 lbs buoyancy, UV-resistant.', ec_brand: 'NRS', ec_price: 59.99, ec_promo_price: 59.99, ec_rating: 4.1, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/576173318c63_bottom_left.webp?v=1766163744'], ec_in_stock: true, additionalFields: {}},
      ],
    },
    'pl-safety-gear': {
      products: [
        {permanentid: 'gid://shopify/ProductVariant/50681803145490', ec_name: 'AquaGuardian Safety Vest - Red / Adult Universal', ec_shortdesc: 'Perfect companion for recreational boaters. Type III with 16 lbs buoyancy.', ec_brand: 'Stearns', ec_price: 59.99, ec_promo_price: 59.99, ec_rating: 3.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/5d0082428ac8_bottom_left.webp?v=1766163681'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681980125458', ec_name: 'EcoRider Safety Helmet - Red / M', ec_shortdesc: 'Top-notch protection for cyclists and kayakers. MIPS technology with 10 vents.', ec_brand: 'Giro', ec_price: 89.99, ec_promo_price: 89.99, ec_rating: 3.8, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/b3520520926a_bottom_left_ad62e624-fbaa-4df1-913c-73a5c2ff031f.webp?v=1766164679'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681812156690', ec_name: 'GlowGuard Safety Buoy - White / Custom', ec_shortdesc: 'Stay safe and visible on the water. Glow-in-the-dark strips for maximum visibility.', ec_brand: 'Taylor Made', ec_price: 39.99, ec_promo_price: 39.99, ec_rating: 4.9, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/fea5b20c25f9_bottom_right.webp?v=1766163723'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681814221074', ec_name: 'Ultimate Safety Throw - Yellow / Oversized', ec_shortdesc: 'Designed for Water Safety Personnel. Type IV with safety reflectors.', ec_brand: 'Taylor Made', ec_price: 39.99, ec_promo_price: 39.99, ec_rating: 4.9, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/a217ecc7a7fb_bottom_right_2f033c9b-7f45-4005-b804-5e0a815552c0.webp?v=1766163729'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681803473170', ec_name: 'EcoPaddle Safety Vest - Green / Oversized', ec_shortdesc: 'Navigate waters with peace of mind. Inflatable Type III with 18 lbs buoyancy.', ec_brand: 'NRS', ec_price: 79.99, ec_promo_price: 79.99, ec_rating: 4.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/a319e692051e_bottom_right_6c074470-75d5-436b-bcaf-66d39a979e2b.webp?v=1766163683'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681816285458', ec_name: 'Professional Sailor Safety Vest - Green / Adult Universal', ec_shortdesc: 'Ultimate safety for dedicated sailors. Type V Work Vest, TÜV approved.', ec_brand: 'Kent', ec_price: 149.99, ec_promo_price: 149.99, ec_rating: 4.8, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/d23f0b005c0e_bottom_left_1181bd01-9930-4ca0-9661-7d9a7fc06569.webp?v=1766163741'], ec_in_stock: true, additionalFields: {}},
        {permanentid: 'gid://shopify/ProductVariant/50681808486674', ec_name: 'AquaGuard Type IV - Blue / Adjustable', ec_shortdesc: 'Designed for boaters who prioritize safety. Marine-grade vinyl with maximum buoyancy.', ec_brand: 'Mustang Survival', ec_price: 49.99, ec_promo_price: 49.99, ec_rating: 3.0, ec_images: ['https://cdn.shopify.com/s/files/1/0910/6502/4786/files/742342dd88c6_top_left.webp?v=1766163706'], ec_in_stock: true, additionalFields: {}},
      ],
    },
    'next-actions-ctrl-1': {
      actions: [
        {text: 'Compare life jackets by size', type: 'followup'},
        {text: 'Show safety vests under $100', type: 'followup'},
        {text: 'View boating helmets and buoys', type: 'followup'},
      ],
    },
  },
});

const middleEvents: ConverseEvent[] = [
  ...toolCall({
    toolCallId: 'tc-route-discovery',
    toolCallName: 'route_discovery',
    parentMessageId: 'msg-discovery',
    args: {intent: 'discovery', query: 'boating safety'},
    resultMessageId: 'tc-route-discovery-result',
    resultContent: '"Routed to discovery flow."',
  }),
  ...toolCall({
    toolCallId: 'tc-search-lifejackets',
    toolCallName: 'coveo_commerce_search',
    parentMessageId: 'msg-discovery',
    args: {query: 'life jackets boating safety', category: 'Life Jackets'},
    resultMessageId: 'tc-search-lifejackets-result',
    resultContent: '"Found 12 life jackets."',
  }),
  ...toolCall({
    toolCallId: 'tc-search-safety',
    toolCallName: 'coveo_commerce_search',
    parentMessageId: 'msg-discovery',
    args: {query: 'boating safety gear equipment', category: 'Safety Gear'},
    resultMessageId: 'tc-search-safety-result',
    resultContent: '"Found 7 safety gear items."',
  }),
  ...toolCall({
    toolCallId: 'tc-store-render-plan',
    toolCallName: 'store_render_plan',
    parentMessageId: 'msg-discovery',
    args: {route: 'discovery'},
    resultMessageId: 'tc-store-render-plan-result',
    resultContent: '"Stored render plan for route \'discovery\' with 2 carousels."',
  }),
  ...textMessage(
    'msg-discovery',
    "We've rounded up 12 life jackets and 7 pieces of boating safety gear to keep you protected on the water. Browse the collections above to find the right fit for your crew and activity—from child sizes to oversized options, plus helmets, vests, buoys, and throw lines."
  ),
  {...carousel1SurfaceActivity, delayMs: 2500},
  {...stateSnapshot, delayMs: 50},
  {...carousel2SurfaceActivity, delayMs: 300},
  {...nextActionsSurfaceActivity, delayMs: 800},
];

const schemaDiscoveryEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaDiscoveryEvents};
