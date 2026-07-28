import {
  ActivitySnapshot,
  RunFinished,
  RunStarted,
  TurnComplete,
  TurnStarted,
  textMessage,
  type ConverseEvent,
} from '../events.js';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ControllerAction {
  controllerId: string;
  controllerSchema: string;
  action: string;
  payload: unknown;
}

const CART_SCHEMA = 'https://schema.thermidor.coveo.com/controllers/cart.schema.json';
const SURFACE_ID = 'commerce-catalog-example';
const DEMO_ITEM: CartItem = {
  productId: 'trail-running-shoes-001',
  name: 'Peak Trail Running Shoes',
  price: 99.99,
  quantity: 1,
};

const featuredProducts = [
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
];

function createCatalogActivity(items: CartItem[]): ConverseEvent {
  return ActivitySnapshot({
    messageId: SURFACE_ID,
    activityType: 'a2ui-surface',
    replace: true,
    content: {
      a2ui_operations: [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: SURFACE_ID,
            catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
          },
        },
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: SURFACE_ID,
            path: '/',
            value: {
              controllers: {
                'featured-products': {products: featuredProducts},
                'shopping-cart': {items},
              },
            },
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: SURFACE_ID,
            components: [
              {id: 'root', component: 'Column', children: ['featured-products', 'cart']},
              {
                id: 'featured-products',
                component: 'ProductCarousel',
                controllers: {
                  productListController: {
                    controllerId: 'featured-products',
                    controllerSchema:
                      'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
                    state: {path: '/controllers/featured-products'},
                  },
                },
              },
              {
                id: 'cart',
                component: 'Cart',
                controllers: {
                  cartController: {
                    controllerId: 'shopping-cart',
                    controllerSchema: CART_SCHEMA,
                    state: {path: '/controllers/shopping-cart'},
                    actions: {
                      setItems: {
                        functionCall: {
                          call: 'thermidor.dispatchControllerAction',
                          args: {
                            controllerId: 'shopping-cart',
                            controllerSchema: CART_SCHEMA,
                            action: 'setItems',
                            payload: {items: []},
                          },
                          returnType: 'void',
                        },
                      },
                      updateItemQuantity: {
                        functionCall: {
                          call: 'thermidor.dispatchControllerAction',
                          args: {
                            controllerId: 'shopping-cart',
                            controllerSchema: CART_SCHEMA,
                            action: 'updateItemQuantity',
                            payload: {item: {...DEMO_ITEM, quantity: 2}},
                          },
                          returnType: 'void',
                        },
                      },
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
}

function buildThermidorActionResponseEvents(action: ControllerAction): ConverseEvent[] | undefined {
  if (action.controllerId !== 'shopping-cart' || action.controllerSchema !== CART_SCHEMA) {
    return undefined;
  }

  let items: CartItem[] | undefined;
  if (action.action === 'setItems' && isRecord(action.payload)) {
    items = parseCartItems(action.payload['items']);
  } else if (action.action === 'updateItemQuantity' && isRecord(action.payload)) {
    const item = parseCartItem(action.payload['item']);
    if (item) {
      items = [item];
    }
  }

  if (!items) {
    return undefined;
  }

  return [RunStarted(), createCatalogActivity(items), RunFinished(), TurnComplete()];
}

function parseCartItems(value: unknown): CartItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.map(parseCartItem);
  return items.every((item): item is CartItem => item !== undefined) ? items : undefined;
}

function parseCartItem(value: unknown): CartItem | undefined {
  if (
    !isRecord(value) ||
    typeof value['productId'] !== 'string' ||
    typeof value['name'] !== 'string' ||
    typeof value['price'] !== 'number' ||
    value['price'] <= 0 ||
    typeof value['quantity'] !== 'number' ||
    !Number.isInteger(value['quantity']) ||
    value['quantity'] < 1
  ) {
    return undefined;
  }
  return {
    productId: value['productId'],
    name: value['name'],
    price: value['price'],
    quantity: value['quantity'],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const thermidorSchemaCatalogResponseEvents: ConverseEvent[] = [
  TurnStarted(),
  RunStarted(),
  ...textMessage(
    'thermidor-schema-catalog-message',
    'Here are featured products and the current cart from the Thermidor catalog contract.'
  ),
  createCatalogActivity([DEMO_ITEM]),
  RunFinished(),
  TurnComplete(),
];

export {buildThermidorActionResponseEvents, thermidorSchemaCatalogResponseEvents};
export type {ControllerAction};
