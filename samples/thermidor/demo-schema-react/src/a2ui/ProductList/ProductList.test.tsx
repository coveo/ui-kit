import {cleanup, fireEvent, screen} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {renderProductCardCartActions} from '../../cart/AddToCartControl/product-card-cart-actions.js';
import {CartProvider} from '../../cart/CartProvider.js';
import {createFakeCartStore, type FakeCartStore} from '../../test/fake-cart-store.js';
import {mountSurface} from '../mount-surface.harness.js';
import {ProductCardActionsContext} from '../ProductCard/product-card-actions.js';

afterEach(() => cleanup());

const BOARD = {
  permanentid: 'board',
  ec_name: 'Surfboard',
  ec_price: 400,
  ec_promo_price: 350,
  ec_images: ['https://example.com/board.png', 'https://example.com/board-back.png'],
  clickUri: 'https://example.com/board',
  additionalFields: {},
};

const UNNAMED_WAX = {
  permanentid: 'wax',
  ec_price: 4.5,
  ec_promo_price: 5,
  additionalFields: {},
};

const LEASH = {
  permanentid: 'leash',
  ec_name: 'Leash',
  additionalFields: {},
};

function mountGrid(products: unknown[], store: FakeCartStore) {
  function Wrapper({children}: PropsWithChildren) {
    return (
      <CartProvider store={store}>
        <ProductCardActionsContext.Provider value={renderProductCardCartActions}>
          {children}
        </ProductCardActionsContext.Provider>
      </CartProvider>
    );
  }
  mountSurface({
    component: {component: 'ProductList', products: {path: '/state/root/products'}},
    dataModel: [{path: '/state/root/products', value: products}],
    wrapper: Wrapper,
  });
}

describe('ProductList', () => {
  it('renders an add-to-cart control for the product of each card', async () => {
    const store = createFakeCartStore();
    mountGrid([BOARD, UNNAMED_WAX], store);

    fireEvent.click(await screen.findByRole('button', {name: 'Add to cart, Surfboard'}));
    fireEvent.click(screen.getByRole('button', {name: 'Add to cart, wax'}));

    expect(store.add).toHaveBeenCalledWith(
      {
        productId: 'board',
        name: 'Surfboard',
        imageUrl: 'https://example.com/board.png',
        clickUri: 'https://example.com/board',
        unitPrice: 350,
      },
      1
    );
    expect(store.add).toHaveBeenCalledWith(
      expect.objectContaining({productId: 'wax', name: 'wax', unitPrice: 4.5}),
      1
    );
  });

  it('renders no control for a product without a price', async () => {
    const store = createFakeCartStore();
    mountGrid([LEASH], store);

    const card = (await screen.findByText('Leash')).closest('article')!;
    expect(screen.queryByRole('button')).toBeNull();
    expect(card.children).toHaveLength(2);
  });
});
