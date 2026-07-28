import {describe, expect, it, vi} from 'vitest';
import {createThermidorCatalog, thermidorCatalogDefinitions} from './components.js';
import {DataContext, MessageProcessor} from '@a2ui/web_core/v0_9';
import {
  cartControllerContract,
  cartItemSchema,
  controllerActionDispatcherFunction,
  controllerActionInvocationSchema,
  productListControllerContract,
  productSchema,
} from '@coveo/thermidor-contracts';

const CART_SCHEMA = 'https://schema.thermidor.coveo.com/controllers/cart.schema.json';
const DEMO_ITEM = {productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1};

const functionAction = (action: string, payload: unknown) => ({
  functionCall: {
    call: controllerActionDispatcherFunction.name,
    args: {
      controllerId: 'shopping-cart',
      controllerSchema: CART_SCHEMA,
      action,
      payload,
    },
    returnType: controllerActionDispatcherFunction.returnType,
  },
});

describe('thermidorCatalogDefinitions', () => {
  it('accepts data-model bindings and function-call actions supplied by the catalog message', () => {
    expect(
      thermidorCatalogDefinitions.ProductCarousel.props.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema:
              'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
            state: {path: '/controllers/featured-products'},
          },
        },
      }).success
    ).toBe(true);
    expect(
      thermidorCatalogDefinitions.Cart.props.safeParse({
        controllers: {
          cartController: {
            controllerId: 'shopping-cart',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
            state: {path: '/controllers/shopping-cart'},
            actions: {
              setItems: functionAction('setItems', {items: []}),
              updateItemQuantity: functionAction('updateItemQuantity', {item: DEMO_ITEM}),
            },
          },
        },
      }).success
    ).toBe(true);
  });

  it('validates generated Product and CartItem values against their JSON Schema constraints', () => {
    expect(
      productSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: null,
        additionalFields: {},
        children: [{permanentid: 'p1-blue', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(
      productSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: 6,
        additionalFields: {},
      }).success
    ).toBe(false);
    expect(
      cartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: 0, quantity: 1})
        .success
    ).toBe(false);
    expect(
      cartItemSchema.safeParse({productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1.5})
        .success
    ).toBe(false);
  });

  it('enforces the controller contract literals and closed binding objects from JSON Schema', () => {
    expect(
      thermidorCatalogDefinitions.ProductCarousel.props.safeParse({
        controllers: {
          productListController: {
            controllerId: 'featured-products',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
          },
        },
      }).success
    ).toBe(false);
    expect(
      thermidorCatalogDefinitions.Cart.props.safeParse({
        controllers: {
          cartController: {
            controllerId: 'shopping-cart',
            controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
            state: {path: '/controllers/shopping-cart'},
            actions: {
              setItems: functionAction('setItems', {items: []}),
              updateItemQuantity: functionAction('updateItemQuantity', {item: DEMO_ITEM}),
            },
            unexpected: true,
          },
        },
      }).success
    ).toBe(false);
  });

  it('validates generated controller state and action contracts', () => {
    expect(
      productListControllerContract.shape.state.safeParse({
        products: [{permanentid: 'p1', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(cartControllerContract.shape.state.safeParse({items: []}).success).toBe(true);
    expect(
      cartControllerContract.shape.setItems.safeParse({
        items: [{productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 1}],
      }).success
    ).toBe(true);
    expect(
      cartControllerContract.shape.updateItemQuantity.safeParse({
        item: {productId: 'p1', name: 'Trail shoes', price: 99.99, quantity: 0},
      }).success
    ).toBe(false);
  });

  it('validates both variants of the generated controller action invocation', () => {
    expect(
      controllerActionInvocationSchema.safeParse({
        controllerId: 'shopping-cart',
        controllerSchema: CART_SCHEMA,
        action: 'setItems',
        payload: {items: []},
      }).success
    ).toBe(true);
    expect(
      controllerActionInvocationSchema.safeParse({
        controllerId: 'shopping-cart',
        controllerSchema: CART_SCHEMA,
        action: 'updateItemQuantity',
        payload: {item: {...DEMO_ITEM, quantity: 2}},
      }).success
    ).toBe(true);
    expect(
      controllerActionInvocationSchema.safeParse({
        controllerId: 'shopping-cart',
        controllerSchema: CART_SCHEMA,
        action: 'updateItemQuantity',
        payload: {item: {...DEMO_ITEM, quantity: 0}},
      }).success
    ).toBe(false);
  });

  it('forwards a function call without emitting an A2UI event or mutating its data model', () => {
    const dispatchAction = vi.fn().mockResolvedValue(undefined);
    const onA2uiAction = vi.fn();
    const catalog = createThermidorCatalog({dispatchAction});
    const processor = new MessageProcessor([catalog], onA2uiAction);
    processor.processMessages([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'catalog',
          catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'catalog',
          path: '/',
          value: {controllers: {'shopping-cart': {items: [DEMO_ITEM]}}},
        },
      },
    ]);
    const surface = processor.model.getSurface('catalog');
    expect(surface).toBeDefined();
    const before = structuredClone(surface!.dataModel.get('/'));

    new DataContext(surface!, '/').resolveAction(functionAction('setItems', {items: []}));

    expect(dispatchAction).toHaveBeenCalledWith({
      controllerId: 'shopping-cart',
      controllerSchema: CART_SCHEMA,
      action: 'setItems',
      payload: {items: []},
    });
    expect(onA2uiAction).not.toHaveBeenCalled();
    expect(surface!.dataModel.get('/')).toEqual(before);
  });
});
