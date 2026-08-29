import {buildConversationResponse} from './shared.js';
import {ActivitySnapshot, type ConverseEvent} from '../events.js';

const runId = '077b8825-f622-4787-9a08-6f2d1c69bb79';

const products = [
  {
    resultType: 'product',
    additionalFields: {},
    queryPinned: false,
    badgePlacements: [],
    ec_name: 'HydroLite Sleeveless Wetsuit - Black / XL',
    ec_description:
      'Dive into your next swimming adventure with the HydroLite Sleeveless Wetsuit. Designed specifically for men, this wetsuit caters to swimmers with its stretch fabric and lightweight insulation, ensuring both flexibility and comfort.',
    ec_shortdesc:
      'Dive into your next swimming adventure with the HydroLite Sleeveless Wetsuit. Designed for men with stretch fabric and lightweight insulation.',
    ec_brand: 'Billabong',
    ec_category: [
      'Sporting Goods',
      'Sporting Goods|Outdoor Recreation',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel|Wetsuits',
    ],
    ec_thumbnails: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/9544b604673a_top_left.webp?v=1766163798',
    ],
    ec_images: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/9544b604673a_top_left.webp?v=1766163798',
    ],
    ec_price: 99.99,
    ec_promo_price: 99.99,
    ec_in_stock: true,
    ec_item_group_id: '9934128414994',
    ec_rating: 4.4,
    ec_product_id: 'gid://shopify/ProductVariant/50674589237522',
    ec_gender: 'Men',
    ec_color: 'Black',
    ec_listing: '',
    clickUri: 'https://barca-sports.myshopify.com/products/bgwets_272d',
    permanentid: 'gid://shopify/ProductVariant/50674589237522',
    nameHighlights: [{length: 7, offset: 21}],
    excerpt:
      'Designed specifically for men, this wetsuit caters to swimmers with its stretch fabric.',
    excerptHighlights: [{length: 7, offset: 36}],
    children: [],
    totalNumberOfChildren: 12,
  },
  {
    resultType: 'product',
    additionalFields: {},
    queryPinned: false,
    badgePlacements: [],
    ec_name: 'EcoWave Performance Wetsuit - Yellow / XL',
    ec_description:
      'Dive into your aquatic adventures with the EcoWave Performance Wetsuit, designed for men who demand excellence in the water. Crafted from eco-friendly stretch fabric with a multi-directional stretch for unmatched flexibility.',
    ec_shortdesc:
      'Dive into your aquatic adventures with the EcoWave Performance Wetsuit, designed for men who demand excellence in the water.',
    ec_brand: 'Billabong',
    ec_category: [
      'Sporting Goods',
      'Sporting Goods|Outdoor Recreation',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel|Wetsuits',
    ],
    ec_thumbnails: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f3c1a327fd8f_top_left.webp?v=1766164203',
    ],
    ec_images: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f3c1a327fd8f_top_left.webp?v=1766164203',
    ],
    ec_price: 199.99,
    ec_promo_price: 199.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144897298',
    ec_rating: 3.0,
    ec_product_id: 'gid://shopify/ProductVariant/50674626461970',
    ec_gender: 'Men',
    ec_color: 'Yellow',
    ec_listing: '',
    clickUri: 'https://barca-sports.myshopify.com/products/bgwetf_dc19',
    permanentid: 'gid://shopify/ProductVariant/50674626461970',
    nameHighlights: [{length: 7, offset: 20}],
    excerpt:
      'Aquatic adventures with the EcoWave Performance Wetsuit, designed for men who demand excellence.',
    excerptHighlights: [{length: 7, offset: 52}],
    children: [],
    totalNumberOfChildren: 12,
  },
  {
    resultType: 'product',
    additionalFields: {},
    queryPinned: false,
    badgePlacements: [],
    ec_name: 'PaddlePro Sleeveless Wetsuit - Yellow / XL',
    ec_description:
      'Introducing the PaddlePro Sleeveless Wetsuit, the ultimate gear for women paddleboarders who value performance and comfort. Engineered with UV-resistant and biodegradable coatings.',
    ec_shortdesc:
      'The ultimate gear for women paddleboarders who value performance and comfort. Engineered with UV-resistant coatings.',
    ec_brand: 'Quiksilver',
    ec_category: [
      'Sporting Goods',
      'Sporting Goods|Outdoor Recreation',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel|Wetsuits',
    ],
    ec_thumbnails: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f3f5c43dc038_bottom_left_b53a6afc-3363-4f2c-b378-d82bf966320a.webp?v=1766163794',
    ],
    ec_images: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/f3f5c43dc038_bottom_left_b53a6afc-3363-4f2c-b378-d82bf966320a.webp?v=1766163794',
    ],
    ec_price: 99.99,
    ec_promo_price: 99.99,
    ec_in_stock: true,
    ec_item_group_id: '9934128185618',
    ec_rating: 3.3,
    ec_product_id: 'gid://shopify/ProductVariant/50674588090642',
    ec_gender: 'Women',
    ec_color: 'Yellow',
    ec_listing: '',
    clickUri: 'https://barca-sports.myshopify.com/products/qswets_5bb5',
    permanentid: 'gid://shopify/ProductVariant/50674588090642',
    nameHighlights: [{length: 7, offset: 21}],
    excerpt:
      'Introducing the PaddlePro Sleeveless Wetsuit, the ultimate gear for women paddleboarders.',
    excerptHighlights: [{length: 7, offset: 37}],
    children: [],
    totalNumberOfChildren: 12,
  },
  {
    resultType: 'product',
    additionalFields: {},
    queryPinned: false,
    badgePlacements: [],
    ec_name: 'WaveRider Shorty Wetsuit - Blue / M',
    ec_description:
      'Experience the perfect blend of comfort, durability, and performance with the WaveRider Shorty Wetsuit. Ideal for women surfers, this premium wetsuit is crafted from eco-friendly Limestone Neoprene.',
    ec_shortdesc:
      'Experience the perfect blend of comfort, durability, and performance with the WaveRider Shorty Wetsuit for women surfers.',
    ec_brand: "O'Neill",
    ec_category: [
      'Sporting Goods',
      'Sporting Goods|Outdoor Recreation',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel|Wetsuits',
    ],
    ec_thumbnails: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/92e2a0512087_top_right_92b11609-1991-4483-8164-34bffd0558ee.webp?v=1766163803',
    ],
    ec_images: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/92e2a0512087_top_right_92b11609-1991-4483-8164-34bffd0558ee.webp?v=1766163803',
    ],
    ec_price: 129.99,
    ec_promo_price: 129.99,
    ec_in_stock: true,
    ec_item_group_id: '9934128611602',
    ec_rating: 3.0,
    ec_product_id: 'gid://shopify/ProductVariant/50674590613778',
    ec_gender: 'Women',
    ec_color: 'Blue',
    ec_listing: '',
    clickUri: 'https://barca-sports.myshopify.com/products/onwets_ed9f',
    permanentid: 'gid://shopify/ProductVariant/50674590613778',
    nameHighlights: [{length: 7, offset: 17}],
    excerpt: 'The WaveRider Shorty Wetsuit is crafted from eco-friendly Limestone Neoprene.',
    excerptHighlights: [{length: 7, offset: 76}],
    children: [],
    totalNumberOfChildren: 12,
  },
  {
    resultType: 'product',
    additionalFields: {},
    queryPinned: false,
    badgePlacements: [],
    ec_name: 'EcoFlex Paddleboard Wetsuit - Green / XL',
    ec_description:
      'Introducing the EcoFlex Paddleboard Wetsuit, a perfect fusion of comfort, functionality, and eco-friendliness designed especially for women paddleboarders.',
    ec_shortdesc:
      'A perfect fusion of comfort, functionality, and eco-friendliness designed especially for women paddleboarders.',
    ec_brand: 'Xcel',
    ec_category: [
      'Sporting Goods',
      'Sporting Goods|Outdoor Recreation',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel',
      'Sporting Goods|Outdoor Recreation|Boating & Water Sports|Boating & Water Sport Apparel|Wetsuits',
    ],
    ec_thumbnails: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/7627aa438509_top_left_ca565086-9a18-409f-8c26-15a15d591dad.webp?v=1766164206',
    ],
    ec_images: [
      'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/7627aa438509_top_left_ca565086-9a18-409f-8c26-15a15d591dad.webp?v=1766164206',
    ],
    ec_price: 149.99,
    ec_promo_price: 149.99,
    ec_in_stock: true,
    ec_item_group_id: '9934144995602',
    ec_rating: 4.3,
    ec_product_id: 'gid://shopify/ProductVariant/50674626887954',
    ec_gender: 'Women',
    ec_color: 'Green',
    ec_listing: '',
    clickUri: 'https://barca-sports.myshopify.com/products/xcwetf_48c3',
    permanentid: 'gid://shopify/ProductVariant/50674626887954',
    nameHighlights: [{length: 7, offset: 20}],
    excerpt:
      'Introducing the EcoFlex Paddleboard Wetsuit, a perfect fusion of comfort and eco-friendliness.',
    excerptHighlights: [{length: 7, offset: 36}],
    children: [],
    totalNumberOfChildren: 12,
  },
];

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
          catalogId: 'https://agent-gateway.coveo.com/a2ui/commerce/v1/catalog.json',
          surfaceProperties: {placement: 'main'},
          components: [{id: 'root', component: 'ProductSearchSurface'}],
          dataModel: {
            products,
            responseId: '1a45ac8d-a50a-4104-8ef7-7832a43328eb',
            pagination: {
              page: 0,
              pageSize: 20,
              totalEntries: 52,
              totalPages: 3,
            },
            sort: {
              appliedSort: {sortCriteria: 'relevance', fields: []},
              availableSorts: [{sortCriteria: 'relevance', fields: []}],
            },
            query: 'Wetsuits',
            facets: [],
          },
        },
      },
    ],
  },
});

const schemaSearchEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents: [surfaceActivitySnapshot],
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaSearchEvents};
