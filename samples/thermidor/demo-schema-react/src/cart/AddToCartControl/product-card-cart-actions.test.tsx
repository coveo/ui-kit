import {cleanup, fireEvent, screen} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {mountSurface} from '../../a2ui/mount-surface.harness.js';
import {ProductCardActionsContext} from '../../a2ui/ProductCard/product-card-actions.js';
import {createFakeCartStore, type FakeCartStore} from '../../test/fake-cart-store.js';
import {CartProvider} from '../CartProvider.js';
import {renderProductCardCartActions} from './product-card-cart-actions.js';

afterEach(() => cleanup());

const WETSUIT = {
  permanentid: 'wetsuit',
  ec_name: 'ThermoFlex Winter Wetsuit',
  ec_brand: 'Rip Curl',
  ec_price: 449.99,
  ec_promo_price: 399.99,
  ec_images: ['https://example.com/wetsuit.webp', 'https://example.com/wetsuit-back.webp'],
  clickUri: 'https://example.com/products/wetsuit',
  additionalFields: {},
};

const WETSUIT_LINE = {
  productId: 'wetsuit',
  name: 'ThermoFlex Winter Wetsuit',
  imageUrl: 'https://example.com/wetsuit.webp',
  clickUri: 'https://example.com/products/wetsuit',
  unitPrice: 399.99,
};

function cartWrapper(store: FakeCartStore) {
  return ({children}: PropsWithChildren) => (
    <CartProvider store={store}>
      <ProductCardActionsContext.Provider value={renderProductCardCartActions}>
        {children}
      </ProductCardActionsContext.Provider>
    </CartProvider>
  );
}

function mountCarousel(store: FakeCartStore, products: unknown[]) {
  mountSurface({
    component: {
      component: 'ProductCarousel',
      products: {path: '/state/root/products'},
      heading: {path: '/state/root/heading'},
    },
    dataModel: [
      {path: '/state/root/products', value: products},
      {path: '/state/root/heading', value: 'Wetsuits'},
    ],
    wrapper: cartWrapper(store),
  });
}

describe('add to cart from product cards', () => {
  it('adds a carousel product with its promo price, first image and page', async () => {
    const store = createFakeCartStore();
    mountCarousel(store, [WETSUIT]);

    const button = await screen.findByRole('button', {
      name: 'Add to cart, ThermoFlex Winter Wetsuit',
    });
    fireEvent.click(button);

    expect(store.add).toHaveBeenCalledWith(WETSUIT_LINE, 1);
  });

  it('adds the product of a research card', async () => {
    const store = createFakeCartStore();
    mountSurface({
      component: {
        component: 'ProductResearchCard',
        product: {path: '/state/root/product'},
        summary: {path: '/state/root/summary'},
        bullets: {path: '/state/root/bullets'},
      },
      dataModel: [
        {path: '/state/root/product', value: WETSUIT},
        {path: '/state/root/summary', value: 'The warmest suit in the range.'},
        {path: '/state/root/bullets', value: []},
      ],
      wrapper: cartWrapper(store),
    });

    fireEvent.click(
      await screen.findByRole('button', {name: 'Add to cart, ThermoFlex Winter Wetsuit'})
    );

    expect(store.add.mock.calls[0][0]).toMatchObject(WETSUIT_LINE);
  });
});
