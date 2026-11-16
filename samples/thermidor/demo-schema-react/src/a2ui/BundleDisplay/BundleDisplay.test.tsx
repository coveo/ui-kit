import {cleanup, fireEvent, screen, waitFor} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {renderBundleCartActions} from '../../cart/AddBundleToCartButton/AddBundleToCartButton.js';
import {CartProvider} from '../../cart/CartProvider.js';
import {createFakeCartStore, type FakeCartStore} from '../../test/fake-cart-store.js';
import {mountSurface} from '../mount-surface.harness.js';
import {BundleActionsContext} from './bundle-actions.js';

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
const LEASH = {permanentid: 'leash', ec_name: 'Leash', ec_price: 30, additionalFields: {}};
const WAX = {permanentid: 'wax', ec_name: 'Wax', additionalFields: {}};
const PRO_BOARD = {
  permanentid: 'pro-board',
  ec_name: 'Pro board',
  ec_price: 900,
  additionalFields: {},
};

const TIERS = [
  {
    label: 'Starter',
    description: 'The basics.',
    total: 380,
    slots: [
      {categoryLabel: 'Board', childId: 'starter-board'},
      {categoryLabel: 'Leash', childId: 'starter-leash'},
    ],
  },
  {
    label: 'Pro',
    description: 'The best.',
    total: 900,
    slots: [{categoryLabel: 'Board', childId: 'pro-board'}],
  },
];

function summary(id: string, categoryLabel: string, product?: unknown) {
  return {id, component: 'ProductSummary', categoryLabel, ...(product ? {product} : {})};
}

function cartWrapper(store: FakeCartStore) {
  return function Wrapper({children}: PropsWithChildren) {
    return (
      <CartProvider store={store}>
        <BundleActionsContext.Provider value={renderBundleCartActions}>
          {children}
        </BundleActionsContext.Provider>
      </CartProvider>
    );
  };
}

function mountBundle({
  store = createFakeCartStore(),
  leash = LEASH,
  withActions = true,
}: {store?: FakeCartStore; leash?: unknown; withActions?: boolean} = {}) {
  mountSurface({
    component: {component: 'BundleDisplay', heading: 'Surf kit', tiers: TIERS},
    children: [
      summary('starter-board', 'Board', BOARD),
      summary('starter-leash', 'Leash', leash),
      summary('pro-board', 'Board', PRO_BOARD),
    ],
    wrapper: withActions ? cartWrapper(store) : undefined,
  });
  return store;
}

describe('BundleDisplay cart button', () => {
  it("adds one of each of the active tier's products", async () => {
    const store = mountBundle();

    fireEvent.click(await screen.findByRole('button', {name: 'Add the Starter bundle to cart'}));

    expect(store.add).toHaveBeenCalledTimes(2);
    expect(store.add).toHaveBeenNthCalledWith(
      1,
      {
        productId: 'board',
        name: 'Surfboard',
        unitPrice: 350,
        imageUrl: 'https://example.com/board.png',
        clickUri: 'https://example.com/board',
      },
      1
    );
    expect(store.add).toHaveBeenNthCalledWith(
      2,
      {productId: 'leash', name: 'Leash', unitPrice: 30},
      1
    );
  });

  it("adds the newly active tier's products after switching tiers", async () => {
    const store = mountBundle();
    await screen.findByRole('button', {name: 'Add the Starter bundle to cart'});

    fireEvent.click(screen.getByRole('button', {name: 'Pro'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Add the Pro bundle to cart'}));

    expect(store.add).toHaveBeenCalledTimes(1);
    expect(store.add).toHaveBeenCalledWith(
      {productId: 'pro-board', name: 'Pro board', unitPrice: 900},
      1
    );
  });

  it('renders no button while a slot has no product', async () => {
    mountBundle({leash: null});

    await screen.findByText('Surfboard');
    expect(screen.queryByRole('button', {name: /bundle to cart/})).toBeNull();
  });

  it('renders no button when a product has no price', async () => {
    mountBundle({leash: WAX});

    await screen.findByText('Wax');
    expect(screen.queryByRole('button', {name: /bundle to cart/})).toBeNull();
  });

  it('is aria-disabled and adds nothing while one of its products is pending', async () => {
    const store = createFakeCartStore({pendingProductIds: new Set(['leash'])});
    mountBundle({store});

    const button = await screen.findByRole('button', {name: 'Add the Starter bundle to cart'});
    expect(button.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(button);
    expect(store.add).not.toHaveBeenCalled();
  });

  it('renders no button without bundle actions', async () => {
    mountBundle({withActions: false});

    await waitFor(() => expect(screen.queryByText('Surfboard')).not.toBeNull());
    expect(screen.queryByRole('button', {name: /bundle to cart/})).toBeNull();
  });
});
