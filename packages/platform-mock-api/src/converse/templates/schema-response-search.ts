import {buildConversationResponse} from './shared.js';
import {ActivitySnapshot, StateSnapshot, type ConverseEvent} from '../events.js';

const runId = 'b41e5d90-2f8c-4c1e-9b7a-3d6f0a1c8e42';

const CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

const DEFAULT_PAGE_SIZE = 12;

const REGULAR_FACET_DISPLAY_LIMIT = 5;

const CATEGORY_FACET_DISPLAY_LIMIT = 3;

const FACET_SEARCH_PAGE_SIZE = 5;

// The full candidate brand set for ec_brand, ordered as displayed. It is intentionally larger
// than REGULAR_FACET_DISPLAY_LIMIT so the displayed values list is capped while facet search
// can still surface the remaining brands. The set contains many brands sharing the substrings
// 'a' and 's' so facet search spans multiple pages.
const BRAND_CANDIDATES = [
  'Billabong',
  'Quiksilver',
  "O'Neill",
  'Rip Curl',
  'Xcel',
  'Hurley',
  'Vissla',
  'Dakine',
  'FCS',
  'Ocean & Earth',
  'Cressi',
  'Aqua Lung',
  'Perception',
  'Wilderness Systems',
] as const;

const PRICE_RANGES: PriceRange[] = [
  {start: 0, end: 100},
  {start: 100, end: 200},
  {start: 200, end: 100000},
];

const SHOPIFY_CDN = 'https://cdn.shopify.com/s/files/1/0910/6502/4786/files';

// Product imagery is reused from the other mock templates of the same (barca-sports) store,
// grouped by leaf category so each product shows a thematically-matching photo. Categories
// with no dedicated source imagery fall back to the closest available water-sports photos.
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Wetsuits & Drysuits': [
    `${SHOPIFY_CDN}/e49456af9869_top_right_4e211c6c-d13b-40be-95c1-6be80d462a0b.webp?v=1766163802`,
    `${SHOPIFY_CDN}/76060f11c60d_top_left.webp?v=1766163776`,
    `${SHOPIFY_CDN}/7627aa438509_top_left_ca565086-9a18-409f-8c26-15a15d591dad.webp?v=1766164206`,
    `${SHOPIFY_CDN}/041224485b64_top_left.webp?v=1766164210`,
  ],
  Surfboards: [
    `${SHOPIFY_CDN}/8f733582382a_bottom_right_c2b6748c-af4a-4c57-a032-8501dcd7873c.webp?v=1766163591`,
    `${SHOPIFY_CDN}/9f4d63c03a65_top_right_94c671b9-ac1d-41eb-859f-38c3b4bd1f7f.webp?v=1766165468`,
    `${SHOPIFY_CDN}/0541376350e1_top_right_876d522d-c82d-4422-a981-0d4b0fe4e16d.webp?v=1766165470`,
    `${SHOPIFY_CDN}/b0b2a61d3786_top_right.webp?v=1766165469`,
  ],
  Bodyboards: [
    `${SHOPIFY_CDN}/2d9e1cd5cedf_bottom_left_14cdd628-8a5e-4f57-9321-733e27aac3ba.webp?v=1766163587`,
    `${SHOPIFY_CDN}/bb5b45b244be_top_left.webp?v=1766163593`,
  ],
  Skimboards: [
    `${SHOPIFY_CDN}/33559c18d7fb_bottom_left.webp?v=1766165470`,
    `${SHOPIFY_CDN}/9f4d63c03a65_top_right.webp?v=1766165468`,
  ],
  Masks: [
    `${SHOPIFY_CDN}/c23fe94bbae7_bottom_right.webp?v=1766164245`,
    `${SHOPIFY_CDN}/34653b6eb1e8_bottom_right_75a4ba4e-bfd5-44d6-adc3-1b8061c09d14.webp?v=1766164230`,
  ],
  Fins: [
    `${SHOPIFY_CDN}/6db68465bc62_top_left.webp?v=1766164256`,
    `${SHOPIFY_CDN}/6c5ab58fd3f5_bottom_right.webp?v=1766164261`,
  ],
  Snorkels: [
    `${SHOPIFY_CDN}/8af4e50cd011_top_left_a6938c33-c3f4-48d6-afbd-6c1b2e898771.webp?v=1766164228`,
    `${SHOPIFY_CDN}/01cfb1659765_bottom_left_65b6400e-ab9a-40f5-818f-a109dab47a79.webp?v=1766164228`,
  ],
  'Dive Computers': [
    `${SHOPIFY_CDN}/e9058b966da9_bottom_right_b968b329-0db2-450e-b73f-ca7a1399e716.webp?v=1766164967`,
    `${SHOPIFY_CDN}/5b5144b66b6c_top_right_9add3d9f-46c5-459f-9c11-725e8c6e02a9.webp?v=1766164965`,
  ],
  Leashes: [
    `${SHOPIFY_CDN}/62cab15b5dd6_bottom_right_cc346ce4-12c4-4307-8d20-3c0596b25eaa.webp?v=1766164306`,
    `${SHOPIFY_CDN}/7e822aef39bf_top_right_31d9d50b-e514-47d2-9707-db01eecb4d86.webp?v=1766164292`,
  ],
  'Traction Pads': [
    `${SHOPIFY_CDN}/8e2a090e6053_top_right_748d0779-3a2b-459d-b5e9-6c5030ccb5df.webp?v=1766164848`,
  ],
  'Dry Bags': [`${SHOPIFY_CDN}/82b033c27166_top_right.webp?v=1766164333`],
  'Wax Combs': [
    `${SHOPIFY_CDN}/c17515c67a2a_bottom_right_f2bfba7c-b157-4562-a1bd-628ffd9195f1.webp?v=1766164010`,
  ],
  'Board Bags': [
    `${SHOPIFY_CDN}/7620cfca8f66_top_left_8e1f0d5f-53c3-463f-be9b-5810f901f44c.webp?v=1766165540`,
    `${SHOPIFY_CDN}/2478d04df49a_top_right_fdaed644-2078-4c3a-bd51-a63abc8721fa.webp?v=1766165528`,
    `${SHOPIFY_CDN}/e00de82ed908_top_right_e280b1b7-a6dc-4d4c-af21-21423ec4abcd.webp?v=1766165542`,
  ],
  'Surf Wax': [
    `${SHOPIFY_CDN}/5d2beb19c452_bottom_left_68a9434b-8067-4453-8159-f5e91cfb9922.jpg?v=1766164024`,
    `${SHOPIFY_CDN}/d5ab761f07c3_bottom_right.webp?v=1766164031`,
    `${SHOPIFY_CDN}/60a0ffb77280_top_right_6f6ebc3b-5500-45c5-92aa-ffc2d7e0043f.webp?v=1766164032`,
  ],
  'Life Jackets': [
    `${SHOPIFY_CDN}/a7621e6658d4_bottom_right_29681cfc-e9ee-47fb-aa7d-1d0061ddf6b2.webp?v=1766163665`,
    `${SHOPIFY_CDN}/5e0c51297428_top_left_bb56bd05-ccc0-4697-a9a8-fef450f1ad61.webp?v=1766163678`,
    `${SHOPIFY_CDN}/6354784d2d0d_top_left_96083e53-b664-4671-ab7c-98080e06ec5f.webp?v=1766163622`,
    `${SHOPIFY_CDN}/576173318c63_bottom_left.webp?v=1766163744`,
  ],
  Kayaks: [
    `${SHOPIFY_CDN}/73da0f952841_top_right.webp?v=1766164983`,
    `${SHOPIFY_CDN}/bdf6596b6475_bottom_left_9639f177-e9b8-4d50-b2d8-9cdde39d1590.webp?v=1766164972`,
    `${SHOPIFY_CDN}/ff9c34035d2d_top_left.webp?v=1766164975`,
  ],
  Canoes: [
    `${SHOPIFY_CDN}/bfbe661abdc1_bottom_left.webp?v=1766165158`,
    `${SHOPIFY_CDN}/5534d2be50cf_bottom_right.webp?v=1766165176`,
  ],
  'Stand-Up Paddleboards': [
    `${SHOPIFY_CDN}/98b37eae9ea8_bottom_right.webp?v=1766165701`,
    `${SHOPIFY_CDN}/657c3479e2d1_top_left_2baea2ba-3dfc-48d9-b50f-61d76c745b54.webp?v=1766165693`,
    `${SHOPIFY_CDN}/d4f858d86103_top_right_65cb8354-2509-4283-9a1d-b3c426917cda.webp?v=1766165661`,
  ],
  Paddles: [
    `${SHOPIFY_CDN}/aa80175b7983_bottom_left_a378e46b-e870-4b22-9f0d-b163d8b69024.webp?v=1766165207`,
    `${SHOPIFY_CDN}/74848a70a752_bottom_left_b8bceb58-69dc-44ba-9f5e-7a6cf8bb5c7b.webp?v=1766165191`,
  ],
};

// Nearest-fit water-sports photos for leaves without dedicated source imagery (kayaks,
// snorkeling gear, paddles, etc.), so no product falls back to an unrelated placeholder.
const FALLBACK_IMAGES = [
  `${SHOPIFY_CDN}/9f4d63c03a65_top_right_94c671b9-ac1d-41eb-859f-38c3b4bd1f7f.webp?v=1766165468`,
  `${SHOPIFY_CDN}/a319e692051e_bottom_right_6c074470-75d5-436b-bcaf-66d39a979e2b.webp?v=1766163683`,
  `${SHOPIFY_CDN}/76060f11c60d_top_left.webp?v=1766163776`,
];

interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

// The category hierarchy under the shared root chain. Products live only on leaf nodes.
// Category facet values are derived from this tree so children reflect real siblings at a
// level rather than a single hardcoded chain.
const WATER_SPORTS_TREE: CategoryNode = {
  name: 'Sporting Goods',
  children: [
    {
      name: 'Outdoor Recreation',
      children: [
        {
          name: 'Boating & Water Sports',
          children: [
            {name: 'Wetsuits & Drysuits'},
            {
              name: 'Surfing',
              children: [
                {name: 'Surfboards'},
                {name: 'Bodyboards'},
                {name: 'Skimboards'},
                {name: 'Stand-Up Paddleboards'},
              ],
            },
            {
              name: 'Paddling',
              children: [
                {name: 'Kayaks'},
                {name: 'Canoes'},
                {name: 'Paddles'},
                {name: 'Life Jackets'},
              ],
            },
            {
              name: 'Snorkeling & Diving',
              children: [
                {name: 'Masks'},
                {name: 'Snorkels'},
                {name: 'Fins'},
                {name: 'Dive Computers'},
              ],
            },
            {
              name: 'Water Sports Accessories',
              children: [
                {name: 'Surf Wax'},
                {name: 'Leashes'},
                {name: 'Board Bags'},
                {name: 'Traction Pads'},
                {name: 'Wax Combs'},
                {name: 'Dry Bags'},
              ],
            },
          ],
        },
      ],
    },
  ],
};

const ROOT_CHAIN = ['Sporting Goods', 'Outdoor Recreation', 'Boating & Water Sports'];

// Builds the ec_category array for a leaf: one joined ancestor path per depth from the root
// down to and including the leaf. `leafPath` is the segment chain below the shared root chain.
function categoryFor(...leafPath: string[]): string[] {
  const segments = [...ROOT_CHAIN, ...leafPath];
  return segments.map((_, depth) => segments.slice(0, depth + 1).join('|'));
}

interface WaterSportsProduct {
  additionalFields: Record<string, never>;
  ec_name: string;
  ec_brand: string;
  ec_category: string[];
  ec_thumbnails: string[];
  ec_images: string[];
  ec_price: number;
  ec_promo_price: number;
  ec_in_stock: boolean;
  ec_item_group_id: string;
  ec_rating: number;
  ec_color: string;
  clickUri: string;
  permanentid: string;
  children: never[];
}

// Compact product definitions expanded into full product objects below. Brands are spread so
// every candidate brand owns at least one product and several appear across multiple leaves.
interface ProductSeed {
  name: string;
  brand: string;
  leaf: string[];
  price: number;
  color: string;
  rating: number;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  // Wetsuits & Drysuits (6)
  {
    name: 'HydroLite Sleeveless Wetsuit',
    brand: 'Billabong',
    leaf: ['Wetsuits & Drysuits'],
    price: 99.99,
    color: 'Black',
    rating: 4.4,
  },
  {
    name: 'EcoWave Performance Wetsuit',
    brand: 'Xcel',
    leaf: ['Wetsuits & Drysuits'],
    price: 199.99,
    color: 'Yellow',
    rating: 3.0,
  },
  {
    name: 'ArcticShield Full Drysuit',
    brand: "O'Neill",
    leaf: ['Wetsuits & Drysuits'],
    price: 289.99,
    color: 'Black',
    rating: 4.8,
  },
  {
    name: 'SunSeeker Spring Wetsuit',
    brand: 'Rip Curl',
    leaf: ['Wetsuits & Drysuits'],
    price: 89.99,
    color: 'Coral',
    rating: 4.0,
  },
  {
    name: 'DeepBlue Diving Wetsuit',
    brand: 'Cressi',
    leaf: ['Wetsuits & Drysuits'],
    price: 249.99,
    color: 'Navy',
    rating: 4.6,
  },
  {
    name: 'TideRunner Junior Wetsuit',
    brand: 'Hurley',
    leaf: ['Wetsuits & Drysuits'],
    price: 79.99,
    color: 'Teal',
    rating: 4.1,
  },

  // Surfing > Surfboards (4)
  {
    name: 'WaveRider Shortboard Surfboard',
    brand: 'Billabong',
    leaf: ['Surfing', 'Surfboards'],
    price: 449.99,
    color: 'White',
    rating: 4.5,
  },
  {
    name: 'GlideMax Longboard Surfboard',
    brand: 'Vissla',
    leaf: ['Surfing', 'Surfboards'],
    price: 599.99,
    color: 'Blue',
    rating: 4.7,
  },
  {
    name: 'FunFish Foam Surfboard',
    brand: 'Quiksilver',
    leaf: ['Surfing', 'Surfboards'],
    price: 189.99,
    color: 'Yellow',
    rating: 4.2,
  },
  {
    name: 'ProCarve Performance Surfboard',
    brand: 'FCS',
    leaf: ['Surfing', 'Surfboards'],
    price: 279.99,
    color: 'Red',
    rating: 4.3,
  },
  // Surfing > Bodyboards (2)
  {
    name: 'SplashPro Bodyboard',
    brand: 'Hurley',
    leaf: ['Surfing', 'Bodyboards'],
    price: 59.99,
    color: 'Green',
    rating: 3.9,
  },
  {
    name: 'WaveDash Bodyboard',
    brand: 'Ocean & Earth',
    leaf: ['Surfing', 'Bodyboards'],
    price: 79.99,
    color: 'Orange',
    rating: 4.0,
  },
  // Surfing > Skimboards (2)
  {
    name: 'SandSkater Skimboard',
    brand: 'Vissla',
    leaf: ['Surfing', 'Skimboards'],
    price: 99.99,
    color: 'Black',
    rating: 4.1,
  },
  {
    name: 'ShoreGlide Skimboard',
    brand: 'Dakine',
    leaf: ['Surfing', 'Skimboards'],
    price: 129.99,
    color: 'Aqua',
    rating: 4.2,
  },
  // Surfing > Stand-Up Paddleboards (3)
  {
    name: 'CalmWater SUP Paddleboard',
    brand: 'Perception',
    leaf: ['Surfing', 'Stand-Up Paddleboards'],
    price: 549.99,
    color: 'Blue',
    rating: 4.4,
  },
  {
    name: 'TouringPro SUP Paddleboard',
    brand: 'Aqua Lung',
    leaf: ['Surfing', 'Stand-Up Paddleboards'],
    price: 699.99,
    color: 'Teal',
    rating: 4.6,
  },
  {
    name: 'InflateEasy SUP Paddleboard',
    brand: 'Dakine',
    leaf: ['Surfing', 'Stand-Up Paddleboards'],
    price: 399.99,
    color: 'Red',
    rating: 4.0,
  },

  // Paddling > Kayaks (3)
  {
    name: 'RiverRun Sit-On Kayak',
    brand: 'Perception',
    leaf: ['Paddling', 'Kayaks'],
    price: 549.99,
    color: 'Yellow',
    rating: 4.5,
  },
  {
    name: 'LakeGlide Touring Kayak',
    brand: 'Wilderness Systems',
    leaf: ['Paddling', 'Kayaks'],
    price: 899.99,
    color: 'Green',
    rating: 4.8,
  },
  {
    name: 'RapidFin Whitewater Kayak',
    brand: 'Dakine',
    leaf: ['Paddling', 'Kayaks'],
    price: 749.99,
    color: 'Orange',
    rating: 4.3,
  },
  // Paddling > Canoes (2)
  {
    name: 'FamilyVoyage Canoe',
    brand: 'Wilderness Systems',
    leaf: ['Paddling', 'Canoes'],
    price: 999.99,
    color: 'Green',
    rating: 4.6,
  },
  {
    name: 'SoloTrek Canoe',
    brand: 'Perception',
    leaf: ['Paddling', 'Canoes'],
    price: 799.99,
    color: 'Red',
    rating: 4.4,
  },
  // Paddling > Paddles (2)
  {
    name: 'CarbonStroke Kayak Paddle',
    brand: 'Aqua Lung',
    leaf: ['Paddling', 'Paddles'],
    price: 149.99,
    color: 'Black',
    rating: 4.2,
  },
  {
    name: 'AllWater Canoe Paddle',
    brand: 'Dakine',
    leaf: ['Paddling', 'Paddles'],
    price: 59.99,
    color: 'Wood',
    rating: 4.0,
  },
  // Paddling > Life Jackets (2)
  {
    name: 'SafeFloat Adult Life Jacket',
    brand: 'Ocean & Earth',
    leaf: ['Paddling', 'Life Jackets'],
    price: 49.99,
    color: 'Red',
    rating: 4.1,
  },
  {
    name: 'AquaGuard Kids Life Jacket',
    brand: 'Aqua Lung',
    leaf: ['Paddling', 'Life Jackets'],
    price: 39.99,
    color: 'Blue',
    rating: 4.3,
  },

  // Snorkeling & Diving > Masks (2)
  {
    name: 'ClearView Snorkel Mask',
    brand: 'Cressi',
    leaf: ['Snorkeling & Diving', 'Masks'],
    price: 44.99,
    color: 'Black',
    rating: 4.4,
  },
  {
    name: 'PanoramaPro Dive Mask',
    brand: 'Aqua Lung',
    leaf: ['Snorkeling & Diving', 'Masks'],
    price: 89.99,
    color: 'Blue',
    rating: 4.5,
  },
  // Snorkeling & Diving > Snorkels (2)
  {
    name: 'DryTop Snorkel',
    brand: 'Cressi',
    leaf: ['Snorkeling & Diving', 'Snorkels'],
    price: 29.99,
    color: 'Clear',
    rating: 4.0,
  },
  {
    name: 'FlexAir Snorkel',
    brand: 'Ocean & Earth',
    leaf: ['Snorkeling & Diving', 'Snorkels'],
    price: 34.99,
    color: 'Aqua',
    rating: 4.1,
  },
  // Snorkeling & Diving > Fins (2)
  {
    name: 'PowerKick Dive Fins',
    brand: 'Cressi',
    leaf: ['Snorkeling & Diving', 'Fins'],
    price: 79.99,
    color: 'Black',
    rating: 4.3,
  },
  {
    name: 'AquaGlide Snorkel Fins',
    brand: 'Aqua Lung',
    leaf: ['Snorkeling & Diving', 'Fins'],
    price: 59.99,
    color: 'Yellow',
    rating: 4.2,
  },
  // Snorkeling & Diving > Dive Computers (2)
  {
    name: 'DepthMaster Dive Computer',
    brand: 'Aqua Lung',
    leaf: ['Snorkeling & Diving', 'Dive Computers'],
    price: 349.99,
    color: 'Black',
    rating: 4.7,
  },
  {
    name: 'NitroxPro Dive Computer',
    brand: 'Cressi',
    leaf: ['Snorkeling & Diving', 'Dive Computers'],
    price: 299.99,
    color: 'Gray',
    rating: 4.6,
  },

  // Water Sports Accessories > Surf Wax (2)
  {
    name: 'StickyGrip Surf Wax',
    brand: 'Ocean & Earth',
    leaf: ['Water Sports Accessories', 'Surf Wax'],
    price: 9.99,
    color: 'Natural',
    rating: 4.2,
  },
  {
    name: 'TropicHold Surf Wax',
    brand: 'FCS',
    leaf: ['Water Sports Accessories', 'Surf Wax'],
    price: 11.99,
    color: 'Natural',
    rating: 4.1,
  },
  // Water Sports Accessories > Leashes (2)
  {
    name: 'CompLeash Surf Leash',
    brand: 'FCS',
    leaf: ['Water Sports Accessories', 'Leashes'],
    price: 24.99,
    color: 'Black',
    rating: 4.3,
  },
  {
    name: 'BigWave Surf Leash',
    brand: 'Ocean & Earth',
    leaf: ['Water Sports Accessories', 'Leashes'],
    price: 29.99,
    color: 'Blue',
    rating: 4.0,
  },
  // Water Sports Accessories > Board Bags (2)
  {
    name: 'TravelArmor Board Bag',
    brand: 'Dakine',
    leaf: ['Water Sports Accessories', 'Board Bags'],
    price: 89.99,
    color: 'Gray',
    rating: 4.4,
  },
  {
    name: 'DayTripper Board Bag',
    brand: 'FCS',
    leaf: ['Water Sports Accessories', 'Board Bags'],
    price: 69.99,
    color: 'Black',
    rating: 4.2,
  },
  // Water Sports Accessories > Traction Pads (1)
  {
    name: 'GripMax Traction Pad',
    brand: 'FCS',
    leaf: ['Water Sports Accessories', 'Traction Pads'],
    price: 44.99,
    color: 'Black',
    rating: 4.5,
  },
  // Water Sports Accessories > Wax Combs (1)
  {
    name: 'ScrapePro Wax Comb',
    brand: 'Ocean & Earth',
    leaf: ['Water Sports Accessories', 'Wax Combs'],
    price: 4.99,
    color: 'Yellow',
    rating: 3.8,
  },
  // Water Sports Accessories > Dry Bags (1)
  {
    name: 'SealTight Dry Bag',
    brand: 'Dakine',
    leaf: ['Water Sports Accessories', 'Dry Bags'],
    price: 34.99,
    color: 'Green',
    rating: 4.3,
  },
];

// Picks a category-matched image for each product, cycling within a leaf's pool so multiple
// products in the same leaf don't all repeat the first photo.
const leafImageCounters: Record<string, number> = {};
let fallbackImageCounter = 0;

function imageForLeaf(leaf: string[]): string {
  const leafName = leaf[leaf.length - 1];
  const pool = CATEGORY_IMAGES[leafName];
  if (pool && pool.length > 0) {
    const next = leafImageCounters[leafName] ?? 0;
    leafImageCounters[leafName] = next + 1;
    return pool[next % pool.length];
  }
  const fallback = FALLBACK_IMAGES[fallbackImageCounter % FALLBACK_IMAGES.length];
  fallbackImageCounter += 1;
  return fallback;
}

const products: WaterSportsProduct[] = PRODUCT_SEEDS.map((seed, index) => {
  const image = imageForLeaf(seed.leaf);
  const id = 9950000000000 + index;
  return {
    additionalFields: {},
    ec_name: seed.name,
    ec_brand: seed.brand,
    ec_category: categoryFor(...seed.leaf),
    ec_thumbnails: [image],
    ec_images: [image],
    ec_price: seed.price,
    ec_promo_price: seed.price,
    ec_in_stock: true,
    ec_item_group_id: String(id),
    ec_rating: seed.rating,
    ec_color: seed.color,
    clickUri: `https://barca-sports.myshopify.com/products/ws_${index}`,
    permanentid: `gid://shopify/ProductVariant/${50680000000000 + index}`,
    children: [],
  };
});

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

interface PriceRange {
  start: number;
  end: number;
}

interface SearchViewState {
  page: number;
  pageSize: number;
  sortCriteria: string;
  selectedBrands: string[];
  excludedBrands: string[];
  // A single active range covers both a listed range selection and a custom range;
  // the two are mutually exclusive.
  selectedPriceRange: PriceRange | null;
  selectedCategoryPath: string[];
  // Per-facet search state, keyed by facet componentId.
  facetSearchQueries: Record<string, string>;
  facetSearchPages: Record<string, number>;
  // Number of Regular_Facet (brand) values currently displayed, grown/reset via
  // showMoreValues/showLessValues.
  regularFacetDisplayCount: number;
  // Number of Category_Facet child values currently displayed at the active level, grown/reset
  // via showMoreValues/showLessValues and reset when navigating to a new level.
  categoryFacetDisplayCount: number;
}

const DEFAULT_VIEW: SearchViewState = {
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  sortCriteria: 'relevance',
  selectedBrands: [],
  excludedBrands: [],
  selectedPriceRange: null,
  selectedCategoryPath: [],
  facetSearchQueries: {},
  facetSearchPages: {},
  regularFacetDisplayCount: REGULAR_FACET_DISPLAY_LIMIT,
  categoryFacetDisplayCount: CATEGORY_FACET_DISPLAY_LIMIT,
};

// This mock keeps an in-memory view for the single decomposed search surface so it behaves
// like a real (stateful) backend: dimensions not carried by an incoming action are preserved
// rather than reset to defaults. This is a global, single-surface state, which is acceptable
// for a local demo mock (no concurrent surfaces or per-session isolation needed).
let currentView: SearchViewState = {...DEFAULT_VIEW};

const FACET_COMPONENT_IDS = {
  regular: 'facet-brand-2',
  numeric: 'facet-price-2',
  category: 'facet-category-2',
} as const;

function sortProducts(input: WaterSportsProduct[], sortCriteria: string): WaterSportsProduct[] {
  if (sortCriteria === 'price_asc') {
    return [...input].sort((a, b) => a.ec_price - b.ec_price);
  }
  if (sortCriteria === 'price_desc') {
    return [...input].sort((a, b) => b.ec_price - a.ec_price);
  }
  // 'relevance' (and any unknown criteria) preserves the original catalog order.
  return [...input];
}

function filterProducts(view: SearchViewState): WaterSportsProduct[] {
  return products.filter((p) => {
    if (view.excludedBrands.includes(p.ec_brand)) {
      return false;
    }
    if (view.selectedBrands.length > 0 && !view.selectedBrands.includes(p.ec_brand)) {
      return false;
    }
    if (view.selectedPriceRange) {
      const {start, end} = view.selectedPriceRange;
      if (p.ec_price < start || p.ec_price > end) {
        return false;
      }
    }
    if (view.selectedCategoryPath.length > 0) {
      const selected = [...ROOT_CHAIN, ...view.selectedCategoryPath].join('|');
      const categories = Array.isArray(p.ec_category) ? p.ec_category : [p.ec_category];
      if (!categories.some((c) => c === selected || c.startsWith(`${selected}|`))) {
        return false;
      }
    }
    return true;
  });
}

function pageFacetSearch<T>(
  matches: T[],
  page: number
): {canShowMoreResults: boolean; results: T[]} {
  const results = matches.slice(0, (page + 1) * FACET_SEARCH_PAGE_SIZE);
  return {canShowMoreResults: matches.length > results.length, results};
}

function deriveRegularFacetSearch(view: SearchViewState, componentId: string) {
  const query = view.facetSearchQueries[componentId];
  if (!query) {
    return {query: '', canShowMoreResults: false, results: []};
  }

  const page = view.facetSearchPages[componentId] ?? 0;
  const needle = query.toLowerCase();
  // Count without this facet's own brand selection so search results mirror the value list.
  const brandCountBase = filterProducts({...view, selectedBrands: [], excludedBrands: []});
  const matches = BRAND_CANDIDATES.filter((brand) => brand.toLowerCase().includes(needle))
    .map((brand) => ({
      value: brand,
      numberOfResults: brandCountBase.filter((p) => p.ec_brand === brand).length,
    }))
    .filter((match) => match.numberOfResults > 0);

  return {query, ...pageFacetSearch(matches, page)};
}

function deriveRegularFacetValues(view: SearchViewState, componentId: string) {
  // Facet counts reflect the result set as if this facet's own selections were not applied,
  // so selecting one brand never zeroes out the sibling brand counts. Other facets still
  // constrain the counts.
  const brandCountBase = filterProducts({...view, selectedBrands: [], excludedBrands: []});
  const isActive = (brand: string) =>
    view.selectedBrands.includes(brand) || view.excludedBrands.includes(brand);
  const countFor = (brand: string) => brandCountBase.filter((p) => p.ec_brand === brand).length;
  // Eligible values are those with results plus any active value (kept so it can be
  // deselected). The display window and the show-more/less controls are computed against this
  // set — not the full static candidate list — so a facet never shows fewer than the initial
  // increment of available values, and the controls only appear when they are meaningful.
  const eligibleBrands = BRAND_CANDIDATES.filter((brand) => countFor(brand) > 0 || isActive(brand));
  const displayCount = Math.min(view.regularFacetDisplayCount, eligibleBrands.length);
  const displayedPage = eligibleBrands.slice(0, displayCount);
  // Active values that aren't part of the displayed page (selected/excluded through search)
  // are pinned to the top of the list so the user sees their selection.
  const pinnedBrands = eligibleBrands.filter(
    (brand) => isActive(brand) && !displayedPage.includes(brand)
  );
  const displayedBrands = [...pinnedBrands, ...displayedPage];
  const values = displayedBrands.map((brand) => {
    const numberOfResults = countFor(brand);
    let state: 'idle' | 'selected' | 'excluded' = 'idle';
    if (view.selectedBrands.includes(brand)) {
      state = 'selected';
    } else if (view.excludedBrands.includes(brand)) {
      state = 'excluded';
    }
    return {value: brand, numberOfResults, state};
  });

  return {
    field: 'ec_brand',
    displayName: 'Brand',
    values,
    hasActiveValues: view.selectedBrands.length > 0 || view.excludedBrands.length > 0,
    canShowMoreValues: displayCount < eligibleBrands.length,
    canShowLessValues: displayCount > REGULAR_FACET_DISPLAY_LIMIT,
    facetSearch: deriveRegularFacetSearch(view, componentId),
  };
}

function countProductsInRange(filteredProducts: WaterSportsProduct[], range: PriceRange): number {
  return filteredProducts.filter((p) => p.ec_price >= range.start && p.ec_price <= range.end)
    .length;
}

function rangesEqual(a: PriceRange, b: PriceRange): boolean {
  return a.start === b.start && a.end === b.end;
}

function deriveNumericFacetValues(view: SearchViewState) {
  const selectedRange = view.selectedPriceRange;
  // Range counts reflect the result set as if this facet's own range were not applied, so the
  // listed ranges keep stable counts when one of them is selected. Other facets still constrain.
  const priceCountBase = filterProducts({...view, selectedPriceRange: null});
  const values = PRICE_RANGES.map((range) => ({
    start: range.start,
    end: range.end,
    numberOfResults: countProductsInRange(priceCountBase, range),
    state: (selectedRange && rangesEqual(range, selectedRange) ? 'selected' : 'idle') as
      | 'idle'
      | 'selected',
  }))
    // Never surface ranges with no results, but always keep the selected range.
    .filter((v) => v.numberOfResults > 0 || v.state === 'selected');

  const matchesListedRange =
    selectedRange !== null && PRICE_RANGES.some((range) => rangesEqual(range, selectedRange));
  const customRange =
    selectedRange && !matchesListedRange
      ? {
          start: selectedRange.start,
          end: selectedRange.end,
          numberOfResults: countProductsInRange(priceCountBase, selectedRange),
        }
      : null;

  // The domain is the price range available under the other active facets, ignoring this
  // facet's own selection, so a manual range can be picked anywhere within the real bounds.
  const domainProducts = priceCountBase;
  const domain =
    domainProducts.length > 0
      ? {
          min: Math.min(...domainProducts.map((p) => p.ec_price)),
          max: Math.max(...domainProducts.map((p) => p.ec_price)),
        }
      : undefined;

  return {
    field: 'ec_price',
    displayName: 'Price',
    values,
    customRange,
    domain,
    hasActiveValues: selectedRange !== null,
    canShowMoreValues: false,
    canShowLessValues: false,
  };
}

function countProductsUnderCategory(
  filteredProducts: WaterSportsProduct[],
  joinedPath: string
): number {
  return filteredProducts.filter((p) => {
    const categories = Array.isArray(p.ec_category) ? p.ec_category : [p.ec_category];
    return categories.some((c) => c === joinedPath || c.startsWith(`${joinedPath}|`));
  }).length;
}

interface CategoryFacetValue {
  path: string[];
  value: string;
  numberOfResults: number;
}

// `relativePath` is expressed below ROOT_CHAIN (the surface's base path). The emitted value is
// relative to that base so the frontend only ever sees/round-trips the meaningful segments,
// while counts are computed against the full category path.
function categoryValueForPath(
  filteredProducts: WaterSportsProduct[],
  relativePath: string[]
): CategoryFacetValue {
  const fullPath = [...ROOT_CHAIN, ...relativePath].join('|');
  return {
    path: relativePath,
    value: relativePath[relativePath.length - 1],
    numberOfResults: countProductsUnderCategory(filteredProducts, fullPath),
  };
}

// Walks the tree following `segments` and returns the node reached, or null when the path
// does not exist in the tree.
function findNode(segments: string[]): CategoryNode | null {
  let node: CategoryNode | undefined = WATER_SPORTS_TREE;
  for (let i = 0; i < segments.length; i++) {
    if (i === 0) {
      node = node.name === segments[0] ? node : undefined;
    } else {
      node = node?.children?.find((child) => child.name === segments[i]);
    }
    if (!node) {
      return null;
    }
  }
  return node ?? null;
}

// Returns the immediate children of the node at `relativePath` (below ROOT_CHAIN), each as a
// path relative to the base. An empty `relativePath` yields the top-level categories.
function childPathsOf(relativePath: string[]): string[][] {
  const node = findNode([...ROOT_CHAIN, ...relativePath]);
  if (!node?.children) {
    return [];
  }
  return node.children.map((child) => [...relativePath, child.name]);
}

// Every category node BELOW the base path, as a path relative to the base. Used by facet
// search so results (and the paths sent back via selectPath) stay base-relative.
function allNodePaths(): string[][] {
  const baseNode = findNode(ROOT_CHAIN);
  const paths: string[][] = [];
  const walk = (node: CategoryNode, prefix: string[]) => {
    const path = [...prefix, node.name];
    paths.push(path);
    node.children?.forEach((child) => walk(child, path));
  };
  baseNode?.children?.forEach((child) => walk(child, []));
  return paths;
}

function deriveCategoryFacetSearch(view: SearchViewState, componentId: string) {
  const query = view.facetSearchQueries[componentId];
  if (!query) {
    return {query: '', canShowMoreResults: false, results: []};
  }

  const page = view.facetSearchPages[componentId] ?? 0;
  const needle = query.toLowerCase();
  // Count each category against the other active facets only; each value's own path already
  // scopes it, so the facet's current selection is not applied to its own counts.
  const categoryCountBase = filterProducts({...view, selectedCategoryPath: []});
  const matches = allNodePaths()
    .filter((relativePath) => relativePath[relativePath.length - 1].toLowerCase().includes(needle))
    .map((relativePath) => categoryValueForPath(categoryCountBase, relativePath))
    .filter((match) => match.numberOfResults > 0);

  return {query, ...pageFacetSearch(matches, page)};
}

function deriveCategoryFacetValues(view: SearchViewState, componentId: string) {
  const selectedDepth = view.selectedCategoryPath.length;
  // Category counts reflect the other active facets only; each value's own path scopes it, so
  // this facet's current selection is not applied to its own counts.
  const categoryCountBase = filterProducts({...view, selectedCategoryPath: []});
  // ancestry follows the selected chain below the base path, each element being the relative
  // path down to that depth. The last ancestry element equals the selected node.
  const ancestry = view.selectedCategoryPath.map((_, depth) =>
    categoryValueForPath(categoryCountBase, view.selectedCategoryPath.slice(0, depth + 1))
  );
  const selected = selectedDepth > 0 ? ancestry[ancestry.length - 1] : null;

  const allChildren = childPathsOf(view.selectedCategoryPath)
    .map((relativePath) => categoryValueForPath(categoryCountBase, relativePath))
    // Never surface categories with no results under the current (other-facet) constraints.
    .filter((child) => child.numberOfResults > 0);
  const sortedChildren = [...allChildren].sort(
    (a, b) => b.numberOfResults - a.numberOfResults || a.value.localeCompare(b.value)
  );
  const displayCount = Math.min(view.categoryFacetDisplayCount, sortedChildren.length);
  const children = sortedChildren.slice(0, displayCount);

  return {
    field: 'ec_category',
    displayName: 'Category',
    values: {ancestry, selected, children},
    canShowMoreValues: sortedChildren.length > displayCount,
    // Gate on the actual displayed count (bounded by the available children), so a cross-facet
    // filter that shrinks the set below the initial increment also hides "Show less".
    canShowLessValues: displayCount > CATEGORY_FACET_DISPLAY_LIMIT,
    facetSearch: deriveCategoryFacetSearch(view, componentId),
  };
}

function computeComponentsState(view: SearchViewState): Record<string, unknown> {
  const {pageSize, sortCriteria} = view;
  const filteredProducts = filterProducts(view);
  const sortedProducts = sortProducts(filteredProducts, sortCriteria);
  const totalEntries = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const page = Math.min(Math.max(view.page, 0), totalPages - 1);
  const start = page * pageSize;
  const pageProducts = sortedProducts.slice(start, start + pageSize);
  const appliedSort =
    sortOptions[sortCriteria as keyof typeof sortOptions] ?? sortOptions.relevance;

  return {
    'search-box-2': {
      query: 'Water Sports',
    },
    'product-list-2': {
      products: pageProducts,
    },
    'pagination-2': {
      page,
      pageSize,
      totalEntries,
      totalPages,
    },
    'sort-2': {
      appliedSort,
      availableSorts,
    },
    'facet-brand-2': deriveRegularFacetValues(view, FACET_COMPONENT_IDS.regular),
    'facet-price-2': deriveNumericFacetValues(view),
    'facet-category-2': deriveCategoryFacetValues(view, FACET_COMPONENT_IDS.category),
    'facet-manager-2': {
      facetIds: ['facet-brand-2', 'facet-price-2', 'facet-category-2'],
    },
  };
}

const surfaceActivitySnapshot: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-commerce-water-sports-surface',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'ui-commerce-water-sports',
          surfaceType: 'commerceSearch',
          catalogId: CATALOG_ID,
          surfaceProperties: {placement: 'main'},
          components: [
            {
              id: 'search-box-2',
              component: 'SearchBox',
              props: {componentId: 'search-box-2', componentType: 'search-box'},
            },
            {
              id: 'product-list-2',
              component: 'ProductList',
              props: {componentId: 'product-list-2', componentType: 'product-list'},
            },
            {
              id: 'pagination-2',
              component: 'Pagination',
              props: {componentId: 'pagination-2', componentType: 'pagination'},
            },
            {
              id: 'sort-2',
              component: 'Sort',
              props: {componentId: 'sort-2', componentType: 'sort'},
            },
            {
              id: 'facet-brand-2',
              component: 'RegularFacet',
              props: {componentId: 'facet-brand-2', componentType: 'regular-facet'},
            },
            {
              id: 'facet-price-2',
              component: 'NumericFacet',
              props: {componentId: 'facet-price-2', componentType: 'numeric-facet'},
            },
            {
              id: 'facet-category-2',
              component: 'CategoryFacet',
              props: {componentId: 'facet-category-2', componentType: 'category-facet'},
            },
            {
              id: 'facet-manager-2',
              component: 'FacetManager',
              props: {componentId: 'facet-manager-2', componentType: 'facet-manager'},
            },
          ],
        },
      },
    ],
  },
});

// A new "water sports" search resets the surface, so the initial events are built on demand:
// each call resets the in-memory view to defaults and recomputes the initial state snapshot.
function buildWaterSportsInitialEvents(): ConverseEvent[] {
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

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function clearFacetSearch(view: SearchViewState, sourceComponentId: string): SearchViewState {
  const facetSearchQueries = {...view.facetSearchQueries};
  const facetSearchPages = {...view.facetSearchPages};
  delete facetSearchQueries[sourceComponentId];
  delete facetSearchPages[sourceComponentId];
  return {...view, facetSearchQueries, facetSearchPages};
}

function applyFacetSearchAction(
  action: {
    name: string;
    context: Record<string, unknown>;
  },
  sourceComponentId: string
): boolean {
  switch (action.name) {
    case 'search': {
      const query = String(action.context.query ?? '');
      currentView = {
        ...currentView,
        facetSearchQueries: {...currentView.facetSearchQueries, [sourceComponentId]: query},
        facetSearchPages: {...currentView.facetSearchPages, [sourceComponentId]: 0},
      };
      return true;
    }
    case 'showMoreSearchResults': {
      const currentPage = currentView.facetSearchPages[sourceComponentId] ?? 0;
      currentView = {
        ...currentView,
        facetSearchPages: {
          ...currentView.facetSearchPages,
          [sourceComponentId]: currentPage + 1,
        },
      };
      return true;
    }
    case 'clearSearch':
      currentView = clearFacetSearch(currentView, sourceComponentId);
      return true;
    default:
      return false;
  }
}

function deriveRegularFacetState(
  action: {
    name: string;
    context: Record<string, unknown>;
  },
  sourceComponentId: string
): void {
  const value = String(action.context.value ?? '');

  if (applyFacetSearchAction(action, sourceComponentId)) {
    return;
  }

  switch (action.name) {
    case 'toggleSelect': {
      const selectedBrands = toggleInList(currentView.selectedBrands, value);
      const excludedBrands = currentView.excludedBrands.filter((brand) => brand !== value);
      currentView = clearFacetSearch(
        {...currentView, selectedBrands, excludedBrands, page: 0},
        sourceComponentId
      );
      break;
    }
    case 'toggleExclude': {
      const excludedBrands = toggleInList(currentView.excludedBrands, value);
      const selectedBrands = currentView.selectedBrands.filter((brand) => brand !== value);
      currentView = clearFacetSearch(
        {...currentView, selectedBrands, excludedBrands, page: 0},
        sourceComponentId
      );
      break;
    }
    case 'toggleSingleSelect': {
      const isSoleSelected =
        currentView.selectedBrands.length === 1 && currentView.selectedBrands[0] === value;
      currentView = clearFacetSearch(
        {
          ...currentView,
          selectedBrands: isSoleSelected ? [] : [value],
          excludedBrands: [],
          page: 0,
        },
        sourceComponentId
      );
      break;
    }
    case 'toggleSingleExclude': {
      const isSoleExcluded =
        currentView.excludedBrands.length === 1 && currentView.excludedBrands[0] === value;
      currentView = clearFacetSearch(
        {
          ...currentView,
          excludedBrands: isSoleExcluded ? [] : [value],
          selectedBrands: [],
          page: 0,
        },
        sourceComponentId
      );
      break;
    }
    case 'clearAllActiveValues':
      currentView = clearFacetSearch(
        {...currentView, selectedBrands: [], excludedBrands: [], page: 0},
        sourceComponentId
      );
      break;
    case 'showMoreValues': {
      const grown = Math.min(
        currentView.regularFacetDisplayCount + REGULAR_FACET_DISPLAY_LIMIT,
        BRAND_CANDIDATES.length
      );
      currentView = {...currentView, regularFacetDisplayCount: grown};
      break;
    }
    case 'showLessValues':
      currentView = {
        ...currentView,
        regularFacetDisplayCount: REGULAR_FACET_DISPLAY_LIMIT,
      };
      break;
    default:
      break;
  }
}

function deriveNumericFacetState(action: {name: string; context: Record<string, unknown>}): void {
  const range: PriceRange = {
    start: Number(action.context.start),
    end: Number(action.context.end),
  };

  switch (action.name) {
    case 'toggleSelect': {
      const isReToggled =
        currentView.selectedPriceRange !== null &&
        rangesEqual(currentView.selectedPriceRange, range);
      currentView = {
        ...currentView,
        selectedPriceRange: isReToggled ? null : range,
        page: 0,
      };
      break;
    }
    case 'toggleSingleSelect': {
      const isSoleSelected =
        currentView.selectedPriceRange !== null &&
        rangesEqual(currentView.selectedPriceRange, range);
      currentView = {
        ...currentView,
        selectedPriceRange: isSoleSelected ? null : range,
        page: 0,
      };
      break;
    }
    case 'applyCustomRange':
      currentView = {...currentView, selectedPriceRange: range, page: 0};
      break;
    case 'clearAllActiveValues':
      currentView = {...currentView, selectedPriceRange: null, page: 0};
      break;
    default:
      break;
  }
}

function deriveCategoryFacetState(
  action: {
    name: string;
    context: Record<string, unknown>;
  },
  sourceComponentId: string
): void {
  if (applyFacetSearchAction(action, sourceComponentId)) {
    return;
  }

  switch (action.name) {
    case 'selectPath': {
      const path = Array.isArray(action.context.path)
        ? (action.context.path as unknown[]).map((segment) => String(segment))
        : [];
      // Navigating to a new level starts collapsed, so reset the child display count.
      currentView = clearFacetSearch(
        {
          ...currentView,
          selectedCategoryPath: path,
          categoryFacetDisplayCount: CATEGORY_FACET_DISPLAY_LIMIT,
          page: 0,
        },
        sourceComponentId
      );
      break;
    }
    case 'clearSelectedPath':
      currentView = {
        ...currentView,
        selectedCategoryPath: [],
        categoryFacetDisplayCount: CATEGORY_FACET_DISPLAY_LIMIT,
        page: 0,
      };
      break;
    case 'showMoreValues':
      // Grow unbounded by one increment; deriveCategoryFacetValues slices to the number of
      // children present at the active level, and canShowMoreValues guards the control.
      currentView = {
        ...currentView,
        categoryFacetDisplayCount:
          currentView.categoryFacetDisplayCount + CATEGORY_FACET_DISPLAY_LIMIT,
      };
      break;
    case 'showLessValues':
      currentView = {
        ...currentView,
        categoryFacetDisplayCount: CATEGORY_FACET_DISPLAY_LIMIT,
      };
      break;
    default:
      break;
  }
}

function deriveNonFacetState(action: {name: string; context: Record<string, unknown>}): void {
  switch (action.name) {
    case 'selectPage':
      currentView = {...currentView, page: Number(action.context.page) || 0};
      break;
    case 'setPageSize':
      currentView = {
        ...currentView,
        pageSize: Number(action.context.pageSize) || currentView.pageSize,
        page: 0,
      };
      break;
    case 'selectSort':
      // changing sort resets to the first page
      currentView = {
        ...currentView,
        sortCriteria: String(action.context.sortCriteria ?? currentView.sortCriteria),
        page: 0,
      };
      break;
    default:
      break;
  }
}

function deriveViewState(
  action: {
    name: string;
    context: Record<string, unknown>;
  },
  sourceComponentId?: string
): SearchViewState {
  // The mock maintains an in-memory view for the surface and merges the single dimension
  // carried by each action into it, so dimensions the action does not touch are preserved
  // (like a real, stateful backend) instead of being reset to defaults.
  // Action names are shared across facet types (showMoreValues exists on both regular and
  // category facets), so branch on sourceComponentId first, then on action.name.
  switch (sourceComponentId) {
    case FACET_COMPONENT_IDS.regular:
      deriveRegularFacetState(action, FACET_COMPONENT_IDS.regular);
      break;
    case FACET_COMPONENT_IDS.numeric:
      deriveNumericFacetState(action);
      break;
    case FACET_COMPONENT_IDS.category:
      deriveCategoryFacetState(action, FACET_COMPONENT_IDS.category);
      break;
    default:
      deriveNonFacetState(action);
      break;
  }
  return currentView;
}

function buildWaterSportsActionEvents(
  action: {
    name: string;
    context: Record<string, unknown>;
  },
  sourceComponentId?: string
): ConverseEvent[] {
  const view = deriveViewState(action, sourceComponentId);
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

export {buildWaterSportsInitialEvents, buildWaterSportsActionEvents};
