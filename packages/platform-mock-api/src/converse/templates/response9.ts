import {
  ActivitySnapshot,
  RunFinished,
  RunStarted,
  StateSnapshot,
  TurnComplete,
  TurnStarted,
  textMessage,
  type ConverseEvent,
} from '../events.js';

const thermidorCatalogState = {
  controllers: {
    'featured-products': {
      products: [
        {
          permanentid: 'trail-running-shoes-001',
          ec_name: 'Peak Trail Running Shoes',
          ec_shortdesc: 'Responsive trail shoes for everyday adventures.',
          ec_brand: 'Thermidor Outdoor',
          ec_category: ['Footwear', 'Trail Running'],
          ec_price: 129.99,
          ec_promo_price: 99.99,
          ec_images: ['https://images.example.com/products/trail-running-shoes-001.jpg'],
          ec_in_stock: true,
          ec_rating: 4.7,
          clickUri: '/products/trail-running-shoes-001',
          additionalFields: {},
        },
        {
          permanentid: 'summit-pack-020',
          ec_name: 'Summit Day Pack',
          ec_shortdesc: 'A compact, weather-ready 20 L day pack.',
          ec_brand: 'Thermidor Outdoor',
          ec_category: ['Bags', 'Day Packs'],
          ec_price: 89.99,
          ec_images: ['https://images.example.com/products/summit-pack-020.jpg'],
          ec_in_stock: true,
          ec_rating: 4.4,
          clickUri: '/products/summit-pack-020',
          additionalFields: {},
        },
      ],
    },
    'shopping-cart': {
      items: [
        {
          productId: 'trail-running-shoes-001',
          name: 'Peak Trail Running Shoes',
          price: 99.99,
          quantity: 1,
        },
      ],
    },
  },
};

const thermidorSchemaCatalogResponseEvents: ConverseEvent[] = [
  TurnStarted(),
  RunStarted(),
  ...textMessage(
    'thermidor-schema-catalog-message',
    'Here are featured products and the current cart from the Thermidor catalog contract.'
  ),
  StateSnapshot(thermidorCatalogState),
  ActivitySnapshot({
    messageId: 'commerce-catalog-example',
    activityType: 'a2ui-surface',
    replace: true,
    content: {
      a2ui_operations: [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'commerce-catalog-example',
            catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'commerce-catalog-example',
            components: [
              {
                id: 'root',
                component: 'Column',
                children: ['featured-products', 'cart'],
              },
              {
                id: 'featured-products',
                component: 'ProductCarousel',
                controllers: {
                  productListController: {
                    controllerId: 'featured-products',
                    controllerSchema:
                      'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
                  },
                },
              },
              {
                id: 'cart',
                component: 'Cart',
                controllers: {
                  cartController: {
                    controllerId: 'shopping-cart',
                    controllerSchema:
                      'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  }),
  RunFinished(),
  TurnComplete(),
];

export {thermidorSchemaCatalogResponseEvents};
