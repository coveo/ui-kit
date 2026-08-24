import {buildConversationResponse} from './shared.js';
import {
  ActivitySnapshot,
  StateSnapshot,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-bundle-4957b383';

const CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

const bundleSurfaceActivity: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-bundle-display',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'bundle-surface',
          catalogId: CATALOG_ID,
          components: [
            {
              id: 'root',
              component: 'BundleDisplay',
              props: {
                componentId: 'bundle-root',
                componentType: 'bundle-display',
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

const stateSnapshot: ConverseEvent = StateSnapshot({
  components: {
    'bundle-root': {
      tiers: [
        {
          label: 'Budget',
          description:
            'Soft-top boards and essential gear perfect for learning to surf without breaking the bank.',
          slots: [
            {categoryLabel: 'Surfboard', surfaceRef: 'pl-budget-surfboard'},
            {categoryLabel: 'Wetsuit', surfaceRef: 'pl-budget-wetsuit'},
            {categoryLabel: 'Surfboard Bag', surfaceRef: 'pl-budget-bag'},
            {categoryLabel: 'Surf Wax', surfaceRef: 'pl-budget-wax'},
          ],
        },
        {
          label: 'Mid-Range',
          description:
            'Hybrid boards with improved performance and quality apparel for progressing surfers.',
          slots: [
            {categoryLabel: 'Surfboard', surfaceRef: 'pl-midrange-surfboard'},
            {categoryLabel: 'Wetsuit', surfaceRef: 'pl-midrange-wetsuit'},
            {categoryLabel: 'Surfboard Bag', surfaceRef: 'pl-midrange-bag'},
            {categoryLabel: 'Surf Wax', surfaceRef: 'pl-midrange-wax'},
          ],
        },
        {
          label: 'Premium',
          description:
            'High-performance boards and professional-grade gear for serious beginners ready to advance.',
          slots: [
            {categoryLabel: 'Surfboard', surfaceRef: 'pl-premium-surfboard'},
            {categoryLabel: 'Wetsuit', surfaceRef: 'pl-premium-wetsuit'},
            {categoryLabel: 'Surfboard Bag', surfaceRef: 'pl-premium-bag'},
            {categoryLabel: 'Surf Wax', surfaceRef: 'pl-premium-wax'},
          ],
        },
      ],
    },
    'pl-budget-surfboard': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50674988548370',
          ec_name: 'Wave Rider Kids Soft Top - Red',
          ec_shortdesc:
            'Introducing the Wave Rider Kids Soft Top, the perfect beginner surfboard for young aspiring surfers.',
          ec_brand: 'Storm Blade',
          ec_price: 199.99,
          ec_promo_price: 199.99,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/8f733582382a_bottom_right_c2b6748c-af4a-4c57-a032-8501dcd7873c.webp?v=1766163591',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-budget-wetsuit': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50674590384402',
          ec_name: 'EcoFlex Wetsuit for Women - Red / M',
          ec_shortdesc:
            'Dive into your aquatic adventures with the EcoFlex Wetsuit for Women. Designed for recreational water users.',
          ec_brand: 'Patagonia',
          ec_price: 49.99,
          ec_promo_price: 49.99,
          ec_rating: 4.9,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/e49456af9869_top_right_4e211c6c-d13b-40be-95c1-6be80d462a0b.webp?v=1766163802',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-budget-bag': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50677311504658',
          ec_name: 'AquaShield Surfboard Bag - White',
          ec_shortdesc:
            'AquaShield Surfboard Bag, meticulously crafted for competitive athletes seeking unparalleled protection.',
          ec_brand: 'Creatures of Leisure',
          ec_price: 199.99,
          ec_promo_price: 199.99,
          ec_rating: 3.0,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/7620cfca8f66_top_left_8e1f0d5f-53c3-463f-be9b-5810f901f44c.webp?v=1766165540',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-budget-wax': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50670409482514',
          ec_name: 'Ultimate Epoxy Surf Wax',
          ec_shortdesc:
            'Experience peak performance on the waves with Ultimate Epoxy Surf Wax. Expertly formulated for superior grip.',
          ec_brand: 'WaxIt',
          ec_price: 35.0,
          ec_promo_price: 35.0,
          ec_rating: 3.0,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/5d2beb19c452_bottom_left_68a9434b-8067-4453-8159-f5e91cfb9922.jpg?v=1766164024',
          ],
          ec_in_stock: false,
          additionalFields: {},
        },
      ],
    },
    'pl-midrange-surfboard': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50677302952210',
          ec_name: 'WaveMaster Hybrid Shortboard - Blue',
          ec_shortdesc:
            'The ultimate choice for advanced riders seeking top performance on short waves.',
          ec_brand: 'Channel Islands',
          ec_price: 499.99,
          ec_promo_price: 499.99,
          ec_rating: 4.6,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/9f4d63c03a65_top_right_94c671b9-ac1d-41eb-859f-38c3b4bd1f7f.webp?v=1766165468',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-midrange-wetsuit': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50674582290706',
          ec_name: 'Green Wave Glide Wetsuit - Green / L',
          ec_shortdesc:
            'Dive into your next adventure with the Green Wave Glide Wetsuit, specially designed for women.',
          ec_brand: 'Patagonia',
          ec_price: 129.99,
          ec_promo_price: 129.99,
          ec_rating: 4.9,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/76060f11c60d_top_left.webp?v=1766163776',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-midrange-bag': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50675961954578',
          ec_name: 'WaveGuard Surfboard Bag - Blue',
          ec_shortdesc:
            'Designed specifically for surf instructors and beach enthusiasts. Premium EVA foam padding.',
          ec_brand: 'Pro-Lite',
          ec_price: 129.99,
          ec_promo_price: 129.99,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/2478d04df49a_top_right_fdaed644-2078-4c3a-bd51-a63abc8721fa.webp?v=1766165528',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-midrange-wax': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50670410924306',
          ec_name: 'Wave Master Surf Wax',
          ec_shortdesc:
            'Take your surfing to the next level. Engineered from premium polyester for superior grip.',
          ec_brand: 'WaxIt',
          ec_price: 35.0,
          ec_promo_price: 35.0,
          ec_rating: 3.0,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/d5ab761f07c3_bottom_right.webp?v=1766164031',
          ],
          ec_in_stock: false,
          additionalFields: {},
        },
      ],
    },
    'pl-premium-surfboard': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50675335627026',
          ec_name: 'Adventure Thruster Surfboard - Yellow',
          ec_shortdesc:
            'Tailored for adventure seekers, this thruster shortboard offers a perfect blend of performance and durability.',
          ec_brand: 'Channel Islands',
          ec_price: 899.99,
          ec_promo_price: 899.99,
          ec_rating: 4.0,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/0541376350e1_top_right_876d522d-c82d-4422-a981-0d4b0fe4e16d.webp?v=1766165470',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-premium-wetsuit': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50674626887954',
          ec_name: 'EcoFlex Paddleboard Wetsuit - Green / XL',
          ec_shortdesc:
            'A perfect fusion of comfort, functionality, and eco-friendliness for women paddleboarders.',
          ec_brand: 'Xcel',
          ec_price: 149.99,
          ec_promo_price: 149.99,
          ec_rating: 4.3,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/7627aa438509_top_left_ca565086-9a18-409f-8c26-15a15d591dad.webp?v=1766164206',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-premium-bag': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50677311832338',
          ec_name: 'AdventureWave Surfboard Bag - Gray',
          ec_shortdesc:
            'Embrace your adventurous spirit. Weatherproof with robust waterproof coating for unmatched durability.',
          ec_brand: 'Pro-Lite',
          ec_price: 79.99,
          ec_promo_price: 79.99,
          ec_rating: 3.5,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/e00de82ed908_top_right_e280b1b7-a6dc-4d4c-af21-21423ec4abcd.webp?v=1766165542',
          ],
          ec_in_stock: true,
          additionalFields: {},
        },
      ],
    },
    'pl-premium-wax': {
      products: [
        {
          permanentid: 'gid://shopify/ProductVariant/50670411088146',
          ec_name: 'Ultimate Glide Surf Wax',
          ec_shortdesc:
            'Crafted with both epoxy and polyester materials for unmatched performance across all wave conditions.',
          ec_brand: 'Wax and More',
          ec_price: 35.0,
          ec_promo_price: 35.0,
          ec_rating: 4.0,
          ec_images: [
            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/60a0ffb77280_top_right_6f6ebc3b-5500-45c5-92aa-ffc2d7e0043f.webp?v=1766164032',
          ],
          ec_in_stock: false,
          additionalFields: {},
        },
      ],
    },
    'next-actions-root': {
      actions: [
        {text: 'Explore Budget tier ($315 total)', type: 'followup'},
        {text: 'Explore Mid-Range tier ($1,065 total)', type: 'followup'},
        {text: 'Explore Premium tier ($735 total)', type: 'followup'},
        {text: 'Browse all surfboards', type: 'followup'},
      ],
    },
  },
});

const middleEvents: ConverseEvent[] = [
  ...toolCall({
    toolCallId: 'tc-route-bundle',
    toolCallName: 'route_bundle',
    parentMessageId: 'msg-bundle-intro',
    args: {intent: 'bundle', categories: ['surfboard', 'wetsuit', 'bag', 'wax']},
    resultMessageId: 'tc-route-bundle-result',
    resultContent: '"Routed to bundle flow."',
  }),
  ...toolCall({
    toolCallId: 'tc-store-render-plan',
    toolCallName: 'store_render_plan',
    parentMessageId: 'msg-bundle-intro',
    args: {route: 'bundle'},
    resultMessageId: 'tc-store-render-plan-result',
    resultContent: '"Stored render plan for route \'bundle\' with 3 tiers."',
  }),
  ...textMessage(
    'msg-bundle-intro',
    "I've built out your beginner surfing kit with three tiers—Budget ($484.97 total), Mid-Range ($794.97 total), and Premium ($1,164.97 total)—each covering board, wetsuit, bag, and wax to get you started in the water.\n\nPick the tier that fits your comfort level, and you're ready to go."
  ),
  {...bundleSurfaceActivity, delayMs: 2500},
  {...stateSnapshot, delayMs: 50},
  {...nextActionsSurfaceActivity, delayMs: 800},
];

const schemaBundleEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaBundleEvents};
