import {cleanup, fireEvent, screen, waitFor} from '@testing-library/react';
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
  ec_images: ['https://example.com/board.png'],
  clickUri: 'https://example.com/board',
  additionalFields: {},
};
const WAX = {permanentid: 'wax', ec_name: 'Wax', additionalFields: {}};
const PRO_BOARD = {
  permanentid: 'pro_board',
  ec_name: 'Pro board',
  ec_price: 900,
  ec_promo_price: 950,
  additionalFields: {},
};

const TIERS = [
  {
    label: 'Starter',
    description: 'The basics.',
    total: 350,
    slots: [
      {categoryLabel: 'Board', childId: 'starter_board'},
      {categoryLabel: 'Wax', childId: 'starter_wax'},
    ],
  },
  {
    label: 'Pro',
    description: 'The best.',
    total: 900,
    slots: [{categoryLabel: 'Board', childId: 'pro_board'}],
  },
];

function cartWrapper(store: FakeCartStore) {
  return function Wrapper({children}: PropsWithChildren) {
    return (
      <CartProvider store={store}>
        <ProductCardActionsContext.Provider value={renderProductCardCartActions}>
          {children}
        </ProductCardActionsContext.Provider>
      </CartProvider>
    );
  };
}

function mountBundle(store?: FakeCartStore) {
  mountSurface({
    component: {component: 'BundleDisplay', heading: 'Surf kit', tiers: TIERS},
    children: [
      {id: 'starter_board', component: 'ProductSummary', categoryLabel: 'Board', product: BOARD},
      {id: 'starter_wax', component: 'ProductSummary', categoryLabel: 'Wax', product: WAX},
      {id: 'pro_board', component: 'ProductSummary', categoryLabel: 'Board', product: PRO_BOARD},
    ],
    wrapper: store ? cartWrapper(store) : undefined,
  });
}

describe('BundleDisplay cart controls', () => {
  it('adds a bundle item to the cart from its row', async () => {
    const store = createFakeCartStore();
    mountBundle(store);

    fireEvent.click(await screen.findByRole('button', {name: 'Add to cart, Surfboard'}));

    expect(store.add).toHaveBeenCalledWith(
      {
        productId: 'board',
        name: 'Surfboard',
        unitPrice: 350,
        imageUrl: 'https://example.com/board.png',
        clickUri: 'https://example.com/board',
      },
      1
    );
  });

  it('ignores a promo price above the regular price', async () => {
    const store = createFakeCartStore();
    mountBundle(store);
    await screen.findByRole('button', {name: 'Add to cart, Surfboard'});
    fireEvent.click(screen.getByRole('button', {name: 'Pro'}));

    fireEvent.click(await screen.findByRole('button', {name: 'Add to cart, Pro board'}));

    expect(screen.queryByText('$950.00')).toBeNull();
    expect(store.add).toHaveBeenCalledWith(
      expect.objectContaining({productId: 'pro_board', unitPrice: 900}),
      1
    );
  });

  it('gives an item with no price no control', async () => {
    mountBundle(createFakeCartStore());

    await screen.findByRole('button', {name: 'Add to cart, Surfboard'});
    expect(screen.getByText('Wax')).not.toBeNull();
    expect(screen.queryByRole('button', {name: 'Add to cart, Wax'})).toBeNull();
  });

  it("shows the controls of the newly active tier's items", async () => {
    mountBundle(createFakeCartStore());
    await screen.findByRole('button', {name: 'Add to cart, Surfboard'});

    fireEvent.click(screen.getByRole('button', {name: 'Pro'}));

    expect(await screen.findByRole('button', {name: 'Add to cart, Pro board'})).not.toBeNull();
    expect(screen.queryByRole('button', {name: 'Add to cart, Surfboard'})).toBeNull();
  });

  it('renders no control without card actions', async () => {
    mountBundle();

    await waitFor(() => expect(screen.queryByText('Surfboard')).not.toBeNull());
    expect(screen.queryByRole('button', {name: /Add to cart/})).toBeNull();
  });
});
