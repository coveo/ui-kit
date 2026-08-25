import {buildConversationResponse} from './shared.js';
import {ActivitySnapshot, StateSnapshot, type ConverseEvent} from '../events.js';

const runId = '077b8825-f622-4787-9a08-6f2d1c69bb79';

const CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

const DEFAULT_PAGE_SIZE = 12;

const WETSUIT_CATEGORY = [
  'Sporting Goods',
  'Sporting Goods|Outdoor Recreation',
  'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
  'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel',
  'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel|Wetsuits',
];

const IMG_1 =
  'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/9544b604673a_top_left.webp?v=1766163798';
const IMG_2 =
  'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f3c1a327fd8f_top_left.webp?v=1766164203';
const IMG_3 =
  'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f3f5c43dc038_bottom_left_b53a6afc-3363-4f2c-b378-d82bf966320a.webp?v=1766163794';
const IMG_4 =
  'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/92e2a0512087_top_right_92b11609-1991-4483-8164-34bffd0558ee.webp?v=1766163803';
const IMG_5 =
  'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/7627aa438509_top_left_ca565086-9a18-409f-8c26-15a15d591dad.webp?v=1766164206';

const products = [
  {
    additionalFields: {},
    ec_name: 'HydroLite Sleeveless Wetsuit - Black / XL',
    ec_description:
      'Dive into your next swimming adventure with the HydroLite Sleeveless Wetsuit. Designed specifically for men, this wetsuit caters to swimmers with its stretch fabric and lightweight insulation, ensuring both flexibility and comfort.',
    ec_shortdesc:
      'Dive into your next swimming adventure with the HydroLite Sleeveless Wetsuit. Designed for men with stretch fabric and lightweight insulation.',
    ec_brand: 'Billabong',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_1],
    ec_images: [IMG_1],
    ec_price: 99.99,
    ec_promo_price: 99.99,
    ec_in_stock: true,
    ec_item_group_id: '9934128414994',
    ec_rating: 4.4,
    ec_color: 'Black',
    clickUri: 'https://barca-sports.myshopify.com/products/bgwets_272d',
    permanentid: 'gid://shopify/ProductVariant/50674589237522',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'EcoWave Performance Wetsuit - Yellow / XL',
    ec_description:
      'Dive into your aquatic adventures with the EcoWave Performance Wetsuit, designed for men who demand excellence in the water. Crafted from eco-friendly stretch fabric with a multi-directional stretch for unmatched flexibility.',
    ec_shortdesc:
      'Dive into your aquatic adventures with the EcoWave Performance Wetsuit, designed for men who demand excellence in the water.',
    ec_brand: 'Billabong',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_2],
    ec_images: [IMG_2],
    ec_price: 199.99,
    ec_promo_price: 199.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144897298',
    ec_rating: 3.0,
    ec_color: 'Yellow',
    clickUri: 'https://barca-sports.myshopify.com/products/bgwetf_dc19',
    permanentid: 'gid://shopify/ProductVariant/50674626461970',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'PaddlePro Sleeveless Wetsuit - Yellow / XL',
    ec_description:
      'Introducing the PaddlePro Sleeveless Wetsuit, the ultimate gear for women paddleboarders who value performance and comfort. Engineered with UV-resistant and biodegradable coatings.',
    ec_shortdesc:
      'The ultimate gear for women paddleboarders who value performance and comfort. Engineered with UV-resistant coatings.',
    ec_brand: 'Quiksilver',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_3],
    ec_images: [IMG_3],
    ec_price: 99.99,
    ec_promo_price: 99.99,
    ec_in_stock: true,
    ec_item_group_id: '9934128185618',
    ec_rating: 3.3,
    ec_color: 'Yellow',
    clickUri: 'https://barca-sports.myshopify.com/products/qswets_5bb5',
    permanentid: 'gid://shopify/ProductVariant/50674588090642',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'WaveRider Shorty Wetsuit - Blue / M',
    ec_description:
      'Experience the perfect blend of comfort, durability, and performance with the WaveRider Shorty Wetsuit. Ideal for women surfers, this premium wetsuit is crafted from eco-friendly Limestone Neoprene.',
    ec_shortdesc:
      'Experience the perfect blend of comfort, durability, and performance with the WaveRider Shorty Wetsuit for women surfers.',
    ec_brand: "O'Neill",
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_4],
    ec_images: [IMG_4],
    ec_price: 129.99,
    ec_promo_price: 129.99,
    ec_in_stock: true,
    ec_item_group_id: '9934128611602',
    ec_rating: 3.0,
    ec_color: 'Blue',
    clickUri: 'https://barca-sports.myshopify.com/products/onwets_ed9f',
    permanentid: 'gid://shopify/ProductVariant/50674590613778',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'EcoFlex Paddleboard Wetsuit - Green / XL',
    ec_description:
      'Introducing the EcoFlex Paddleboard Wetsuit, a perfect fusion of comfort, functionality, and eco-friendliness designed especially for women paddleboarders.',
    ec_shortdesc:
      'A perfect fusion of comfort, functionality, and eco-friendliness designed especially for women paddleboarders.',
    ec_brand: 'Xcel',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_5],
    ec_images: [IMG_5],
    ec_price: 149.99,
    ec_promo_price: 149.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995602',
    ec_rating: 4.3,
    ec_color: 'Green',
    clickUri: 'https://barca-sports.myshopify.com/products/xcwetf_48c3',
    permanentid: 'gid://shopify/ProductVariant/50674626887954',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'ArcticShield Full Wetsuit - Black / L',
    ec_description:
      'Brave the coldest waters with the ArcticShield Full Wetsuit. Thick thermal neoprene keeps you warm on the longest sessions.',
    ec_shortdesc: 'Brave the coldest waters with thick thermal neoprene for the longest sessions.',
    ec_brand: 'Xcel',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_1],
    ec_images: [IMG_1],
    ec_price: 299.99,
    ec_promo_price: 279.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995603',
    ec_rating: 4.8,
    ec_color: 'Black',
    clickUri: 'https://barca-sports.myshopify.com/products/arctic_full',
    permanentid: 'gid://shopify/ProductVariant/50674626887955',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'SunSeeker Spring Wetsuit - Coral / S',
    ec_description:
      'Light and breezy, the SunSeeker Spring Wetsuit is perfect for warm-water sessions and sunny days at the beach.',
    ec_shortdesc: 'Light and breezy, perfect for warm-water sessions and sunny beach days.',
    ec_brand: 'Quiksilver',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_2],
    ec_images: [IMG_2],
    ec_price: 59.99,
    ec_promo_price: 59.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995604',
    ec_rating: 4.0,
    ec_color: 'Coral',
    clickUri: 'https://barca-sports.myshopify.com/products/sunseeker_spring',
    permanentid: 'gid://shopify/ProductVariant/50674626887956',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'DeepBlue Diving Wetsuit - Navy / XL',
    ec_description:
      'Engineered for scuba divers, the DeepBlue Diving Wetsuit offers superior thermal protection at depth.',
    ec_shortdesc: 'Engineered for scuba divers with superior thermal protection at depth.',
    ec_brand: "O'Neill",
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_3],
    ec_images: [IMG_3],
    ec_price: 249.99,
    ec_promo_price: 249.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995605',
    ec_rating: 4.6,
    ec_color: 'Navy',
    clickUri: 'https://barca-sports.myshopify.com/products/deepblue_diving',
    permanentid: 'gid://shopify/ProductVariant/50674626887957',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'TideRunner Junior Wetsuit - Teal / S',
    ec_description:
      'Made for young surfers, the TideRunner Junior Wetsuit combines flexibility with easy-on entry.',
    ec_shortdesc: 'Made for young surfers, combining flexibility with easy-on entry.',
    ec_brand: 'Billabong',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_4],
    ec_images: [IMG_4],
    ec_price: 79.99,
    ec_promo_price: 69.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995606',
    ec_rating: 4.1,
    ec_color: 'Teal',
    clickUri: 'https://barca-sports.myshopify.com/products/tiderunner_junior',
    permanentid: 'gid://shopify/ProductVariant/50674626887958',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'StormSurge Steamer Wetsuit - Charcoal / M',
    ec_description:
      'The StormSurge Steamer Wetsuit is built for rough conditions, with reinforced seams and sealed zippers.',
    ec_shortdesc: 'Built for rough conditions, with reinforced seams and sealed zippers.',
    ec_brand: 'Rip Curl',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_5],
    ec_images: [IMG_5],
    ec_price: 219.99,
    ec_promo_price: 219.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995607',
    ec_rating: 4.5,
    ec_color: 'Charcoal',
    clickUri: 'https://barca-sports.myshopify.com/products/stormsurge_steamer',
    permanentid: 'gid://shopify/ProductVariant/50674626887959',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'CoralReef Snorkel Wetsuit - Aqua / L',
    ec_description:
      'Perfect for snorkeling excursions, the CoralReef Wetsuit is lightweight yet protective against sun and stings.',
    ec_shortdesc: 'Perfect for snorkeling, lightweight yet protective against sun and stings.',
    ec_brand: 'Cressi',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_1],
    ec_images: [IMG_1],
    ec_price: 89.99,
    ec_promo_price: 89.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995608',
    ec_rating: 3.9,
    ec_color: 'Aqua',
    clickUri: 'https://barca-sports.myshopify.com/products/coralreef_snorkel',
    permanentid: 'gid://shopify/ProductVariant/50674626887960',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'FreeDive Competition Wetsuit - Black / M',
    ec_description:
      'The FreeDive Competition Wetsuit is a premium hydrodynamic suit for serious freedivers chasing personal bests.',
    ec_shortdesc: 'A premium hydrodynamic suit for serious freedivers chasing personal bests.',
    ec_brand: 'Cressi',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_2],
    ec_images: [IMG_2],
    ec_price: 289.99,
    ec_promo_price: 289.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995609',
    ec_rating: 4.7,
    ec_color: 'Black',
    clickUri: 'https://barca-sports.myshopify.com/products/freedive_competition',
    permanentid: 'gid://shopify/ProductVariant/50674626887961',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'BreakerBudget Shorty Wetsuit - Red / L',
    ec_description:
      'An affordable entry point into water sports, the BreakerBudget Shorty covers the basics without breaking the bank.',
    ec_shortdesc: 'An affordable entry point that covers the basics without breaking the bank.',
    ec_brand: 'Generic',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_3],
    ec_images: [IMG_3],
    ec_price: 64.99,
    ec_promo_price: 64.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995610',
    ec_rating: 3.5,
    ec_color: 'Red',
    clickUri: 'https://barca-sports.myshopify.com/products/breakerbudget_shorty',
    permanentid: 'gid://shopify/ProductVariant/50674626887962',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'PolarPlunge Drysuit Hybrid - Slate / XL',
    ec_description:
      'The PolarPlunge Hybrid bridges wetsuit flexibility and drysuit warmth for extreme cold-water enthusiasts.',
    ec_shortdesc: 'Bridges wetsuit flexibility and drysuit warmth for extreme cold water.',
    ec_brand: 'Xcel',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_4],
    ec_images: [IMG_4],
    ec_price: 279.99,
    ec_promo_price: 259.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995611',
    ec_rating: 4.4,
    ec_color: 'Slate',
    clickUri: 'https://barca-sports.myshopify.com/products/polarplunge_hybrid',
    permanentid: 'gid://shopify/ProductVariant/50674626887963',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'SurfPro Chest-Zip Wetsuit - Black / L',
    ec_description:
      'The SurfPro Chest-Zip Wetsuit delivers pro-level performance with a watertight chest-zip entry system.',
    ec_shortdesc: 'Pro-level performance with a watertight chest-zip entry system.',
    ec_brand: 'Rip Curl',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_5],
    ec_images: [IMG_5],
    ec_price: 189.99,
    ec_promo_price: 189.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995612',
    ec_rating: 4.5,
    ec_color: 'Black',
    clickUri: 'https://barca-sports.myshopify.com/products/surfpro_chestzip',
    permanentid: 'gid://shopify/ProductVariant/50674626887964',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'LagoonLite Kids Wetsuit - Purple / XS',
    ec_description:
      'The LagoonLite Kids Wetsuit keeps little swimmers warm and safe with bright colors and durable seams.',
    ec_shortdesc: 'Keeps little swimmers warm and safe with bright colors and durable seams.',
    ec_brand: 'Generic',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_1],
    ec_images: [IMG_1],
    ec_price: 54.99,
    ec_promo_price: 54.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995613',
    ec_rating: 3.8,
    ec_color: 'Purple',
    clickUri: 'https://barca-sports.myshopify.com/products/lagoonlite_kids',
    permanentid: 'gid://shopify/ProductVariant/50674626887965',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'TripleSeason Wetsuit - Ocean / M',
    ec_description:
      'A versatile 3/2mm suit, the TripleSeason Wetsuit is comfortable across spring, summer, and fall waters.',
    ec_shortdesc: 'A versatile 3/2mm suit comfortable across spring, summer, and fall waters.',
    ec_brand: "O'Neill",
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_2],
    ec_images: [IMG_2],
    ec_price: 159.99,
    ec_promo_price: 159.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995614',
    ec_rating: 4.2,
    ec_color: 'Ocean',
    clickUri: 'https://barca-sports.myshopify.com/products/tripleseason',
    permanentid: 'gid://shopify/ProductVariant/50674626887966',
    children: [],
  },
  {
    additionalFields: {},
    ec_name: 'RashGuard Combo Wetsuit - White / L',
    ec_description:
      'The RashGuard Combo pairs a flexible top with a shorty bottom for maximum warm-weather mobility.',
    ec_shortdesc: 'Pairs a flexible top with a shorty bottom for maximum warm-weather mobility.',
    ec_brand: 'Quiksilver',
    ec_category: WETSUIT_CATEGORY,
    ec_thumbnails: [IMG_3],
    ec_images: [IMG_3],
    ec_price: 109.99,
    ec_promo_price: 109.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995615',
    ec_rating: 4.0,
    ec_color: 'White',
    clickUri: 'https://barca-sports.myshopify.com/products/rashguard_combo',
    permanentid: 'gid://shopify/ProductVariant/50674626887967',
    children: [],
  },
];

const sortOptions = {
  relevance: {sortCriteria: 'relevance', fields: [] as {field: string; direction: string}[]},
  price_asc: {
    sortCriteria: 'price_asc',
    fields: [{field: 'ec_price', direction: 'ascending'}],
  },
  price_desc: {
    sortCriteria: 'price_desc',
    fields: [{field: 'ec_price', direction: 'descending'}],
  },
} as const;

const availableSorts = [sortOptions.relevance, sortOptions.price_asc, sortOptions.price_desc];

interface SearchViewState {
  page: number;
  pageSize: number;
  sortCriteria: string;
}

const DEFAULT_VIEW: SearchViewState = {
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  sortCriteria: 'relevance',
};

// This mock keeps an in-memory view for the single decomposed search surface so it behaves
// like a real (stateful) backend: dimensions not carried by an incoming action are preserved
// rather than reset to defaults. This is a global, single-surface state, which is acceptable
// for a local demo mock (no concurrent surfaces or per-session isolation needed).
let currentView: SearchViewState = {...DEFAULT_VIEW};

function sortProducts(sortCriteria: string): typeof products {
  if (sortCriteria === 'price_asc') {
    return [...products].sort((a, b) => a.ec_price - b.ec_price);
  }
  if (sortCriteria === 'price_desc') {
    return [...products].sort((a, b) => b.ec_price - a.ec_price);
  }
  // 'relevance' (and any unknown criteria) preserves the original catalog order.
  return [...products];
}

function computeComponentsState(view: SearchViewState): Record<string, unknown> {
  const {pageSize, sortCriteria} = view;
  const sortedProducts = sortProducts(sortCriteria);
  const totalEntries = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const page = Math.min(Math.max(view.page, 0), totalPages - 1);
  const start = page * pageSize;
  const pageProducts = sortedProducts.slice(start, start + pageSize);
  const appliedSort =
    sortOptions[sortCriteria as keyof typeof sortOptions] ?? sortOptions.relevance;

  return {
    'search-box-1': {
      query: 'Wetsuits',
    },
    'product-list-1': {
      products: pageProducts,
    },
    'pagination-1': {
      page,
      pageSize,
      totalEntries,
      totalPages,
    },
    'sort-1': {
      appliedSort,
      availableSorts,
    },
  };
}

const surfaceActivitySnapshot: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-commerce-search-surface',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'ui-commerce-search',
          surfaceType: 'commerceSearch',
          catalogId: CATALOG_ID,
          surfaceProperties: {placement: 'main'},
          components: [
            {
              id: 'search-box-1',
              component: 'SearchBox',
              props: {componentId: 'search-box-1', componentType: 'search-box'},
            },
            {
              id: 'product-list-1',
              component: 'ProductList',
              props: {componentId: 'product-list-1', componentType: 'product-list'},
            },
            {
              id: 'pagination-1',
              component: 'Pagination',
              props: {componentId: 'pagination-1', componentType: 'pagination'},
            },
            {
              id: 'sort-1',
              component: 'Sort',
              props: {componentId: 'sort-1', componentType: 'sort'},
            },
          ],
        },
      },
    ],
  },
});

// A new "wetsuits" search resets the surface, so the initial events are built on demand:
// each call resets the in-memory view to defaults and recomputes the initial state snapshot.
function buildSearchInitialEvents(): ConverseEvent[] {
  currentView = {...DEFAULT_VIEW};
  const initialStateSnapshot: ConverseEvent = StateSnapshot({
    components: computeComponentsState(currentView),
  });

  return buildConversationResponse({
    runId,
    middleEvents: [surfaceActivitySnapshot, {...initialStateSnapshot, delayMs: 50}],
    includeInitialStateSnapshot: false,
    includeFinalStateSnapshot: false,
  });
}

function deriveViewState(action: {
  name: string;
  context: Record<string, unknown>;
}): SearchViewState {
  // The mock maintains an in-memory view for the surface and merges the single dimension
  // carried by each action into it, so dimensions the action does not touch are preserved
  // (like a real, stateful backend) instead of being reset to defaults.
  switch (action.name) {
    case 'selectPage':
      currentView = {...currentView, page: Number(action.context.page) || 0};
      break;
    case 'setPageSize':
      // changing page size resets to the first page (matches typical commerce behavior)
      currentView = {
        ...currentView,
        pageSize: Number(action.context.pageSize) || currentView.pageSize,
        page: 0,
      };
      break;
    case 'setSort':
      // changing sort resets to the first page
      currentView = {
        ...currentView,
        sortCriteria: String(action.context.sortCriteria ?? currentView.sortCriteria),
        page: 0,
      };
      break;
    default:
      break; // unknown action: leave currentView unchanged
  }
  return currentView;
}

function buildSearchActionEvents(action: {
  name: string;
  context: Record<string, unknown>;
}): ConverseEvent[] {
  const view = deriveViewState(action);
  const stateSnapshot: ConverseEvent = StateSnapshot({
    components: computeComponentsState(view),
  });

  // Action responses update the existing surface: only the STATE_SNAPSHOT changes, so we
  // intentionally omit the ACTIVITY_SNAPSHOT/createSurface that the initial response emits.
  return buildConversationResponse({
    runId,
    middleEvents: [stateSnapshot],
    includeInitialStateSnapshot: false,
    includeFinalStateSnapshot: false,
  });
}

export {buildSearchInitialEvents, buildSearchActionEvents};
