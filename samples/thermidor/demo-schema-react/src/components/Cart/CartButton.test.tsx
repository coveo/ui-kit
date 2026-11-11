import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {PurchaseResult} from '../../cart/cart-api.js';
import {CartProvider} from '../../cart/CartProvider.js';
import {EMPTY_CART, type CartStore} from '../../cart/cart-store.js';
import {cartWith, createFakeCartStore} from '../../test/fake-cart-store.js';
import {CartButton} from './CartButton.js';

const CART = cartWith(
  {
    productId: 'kayak',
    name: 'Kayak',
    imageUrl: 'https://example.com/kayak.png',
    clickUri: 'https://example.com/kayak',
    unitPrice: 500,
    quantity: 2,
  },
  {productId: 'paddle', name: 'Paddle', unitPrice: 45.5, quantity: 1}
);

const PURCHASE: PurchaseResult = {
  currency: 'USD',
  products: [],
  transaction: {id: 'order-42', revenue: 1045.5},
  purchasedAt: '2026-11-11T00:00:00.000Z',
  cart: CART,
};

function renderCart(initial: Parameters<typeof createFakeCartStore>[0] = {}) {
  const store = createFakeCartStore({cart: CART, ...initial});
  const purchase = vi.fn<CartStore['purchase']>(async () => {
    store.set({cart: EMPTY_CART});
    return PURCHASE;
  });
  store.purchase = purchase;
  render(
    <CartProvider store={store}>
      <button type="button">Outside</button>
      <CartButton />
    </CartProvider>
  );
  return {store, purchase, set: store.set};
}

function openCart() {
  fireEvent.click(screen.getByRole('button', {name: /^Cart,/}));
  return screen.getByRole('dialog', {name: 'Cart'});
}

afterEach(() => {
  vi.useRealTimers();
});

describe('CartButton', () => {
  it('labels the button with the number of units, shows them in a badge, and toggles the panel', () => {
    renderCart();
    const button = screen.getByRole('button', {name: 'Cart, 3 items'});

    expect(screen.getByTestId('cart-badge').textContent).toBe('3');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    openCart();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes the panel on Escape inside the cart and returns the focus to the button', () => {
    renderCart();
    const panel = openCart();

    fireEvent.keyDown(screen.getByRole('button', {name: 'Outside'}), {key: 'Escape'});
    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.keyDown(panel, {key: 'Escape'});

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', {name: 'Cart, 3 items'}));
  });

  it('closes the panel when the focus or a click leaves the cart, but not inside it', () => {
    renderCart();
    const panel = openCart();

    fireEvent.blur(panel, {relatedTarget: screen.getByRole('button', {name: 'Add one Kayak'})});
    fireEvent.blur(panel, {relatedTarget: null});
    fireEvent.pointerDown(panel);
    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.blur(panel, {relatedTarget: screen.getByRole('button', {name: 'Outside'})});
    expect(screen.queryByRole('dialog')).toBeNull();

    openCart();
    fireEvent.pointerDown(screen.getByRole('button', {name: 'Outside'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('CartPanel', () => {
  it('lists each line and the totals, and adds, removes one, or removes a whole line', () => {
    const {store} = renderCart();
    const panel = openCart();
    const [kayak, paddle] = within(panel).getAllByRole('listitem');

    expect(kayak.querySelector('img')?.getAttribute('src')).toBe('https://example.com/kayak.png');
    expect(within(kayak).getByRole('link', {name: 'Kayak'}).getAttribute('href')).toBe(
      'https://example.com/kayak'
    );
    expect(within(kayak).getByText('$500.00 each')).toBeDefined();
    expect(within(kayak).getByText('2')).toBeDefined();
    expect(within(kayak).getByText('$1000.00')).toBeDefined();

    expect(paddle.querySelector('img')).toBeNull();
    expect(within(paddle).queryByRole('link')).toBeNull();
    expect(within(paddle).getByText('Paddle')).toBeDefined();

    expect(within(panel).getAllByText('$1045.50')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', {name: 'Add one Kayak'}));
    expect(store.add).toHaveBeenCalledWith(
      {
        productId: 'kayak',
        name: 'Kayak',
        imageUrl: 'https://example.com/kayak.png',
        clickUri: 'https://example.com/kayak',
        unitPrice: 500,
      },
      1
    );

    fireEvent.click(screen.getByRole('button', {name: 'Remove one Kayak'}));
    expect(store.remove).toHaveBeenCalledWith('kayak', 1);

    fireEvent.click(screen.getByRole('button', {name: 'Remove Paddle from the cart'}));
    expect(store.remove).toHaveBeenLastCalledWith('paddle');
  });

  it("disables a product's controls and the purchase while its request is pending", () => {
    const {store, purchase} = renderCart({pendingProductIds: new Set(['kayak'])});
    openCart();

    for (const name of ['Add one Kayak', 'Remove one Kayak', 'Remove Kayak from the cart']) {
      const button = screen.getByRole('button', {name});
      expect(button.getAttribute('aria-disabled')).toBe('true');
      fireEvent.click(button);
    }
    fireEvent.click(screen.getByRole('button', {name: 'Purchase'}));

    expect(store.add).not.toHaveBeenCalled();
    expect(store.remove).not.toHaveBeenCalled();
    expect(purchase).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Add one Paddle'}).getAttribute('aria-disabled')).toBe(
      'false'
    );
    expect(screen.getByRole('button', {name: 'Purchase'}).getAttribute('aria-disabled')).toBe(
      'true'
    );
  });

  it('moves the focus to the next line when the focused line is removed, then to the heading', () => {
    const {set} = renderCart();
    openCart();
    screen.getByRole('button', {name: 'Remove Kayak from the cart'}).focus();

    act(() => set({cart: {...CART, items: [CART.items[1]]}}));
    expect(document.activeElement).toBe(screen.getByRole('button', {name: 'Remove one Paddle'}));

    act(() => set({cart: EMPTY_CART}));
    expect(document.activeElement).toBe(screen.getByRole('heading', {name: 'Your cart'}));
  });

  it('shows an empty state, no badge and no purchase when the cart is empty', () => {
    renderCart({cart: EMPTY_CART});
    expect(screen.queryByTestId('cart-badge')).toBeNull();
    const panel = openCart();

    expect(within(panel).getByText('Your cart is empty')).toBeDefined();
    expect(screen.getByRole('button', {name: 'Purchase'}).getAttribute('aria-disabled')).toBe(
      'true'
    );
  });

  it('shows a loading state until the cart loads', () => {
    renderCart({cart: EMPTY_CART, status: 'loading'});
    const panel = openCart();

    expect(within(panel).getByText('Loading your cart…')).toBeDefined();
  });

  it('purchases and confirms the order until the cart changes', async () => {
    const {purchase, set} = renderCart();
    openCart();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Purchase'}));
    });

    expect(purchase).toHaveBeenCalledOnce();
    expect(screen.getByText('Order placed')).toBeDefined();
    expect(screen.getByText('Order number order-42')).toBeDefined();

    act(() => set({cart: CART}));
    expect(screen.queryByText('Order placed')).toBeNull();
  });

  it('keeps the confirmation of an order placed while the panel was closed', async () => {
    const {purchase, set} = renderCart();
    let complete: () => void = () => {};
    purchase.mockImplementationOnce(
      () =>
        new Promise<PurchaseResult>((resolve) => {
          complete = () => {
            set({cart: EMPTY_CART});
            resolve(PURCHASE);
          };
        })
    );
    const panel = openCart();
    fireEvent.click(screen.getByRole('button', {name: 'Purchase'}));
    expect(screen.getByRole('button', {name: 'Placing order…'})).toBeDefined();

    fireEvent.keyDown(panel, {key: 'Escape'});
    await act(async () => complete());
    openCart();

    expect(screen.getByText('Order number order-42')).toBeDefined();
  });

  it('briefly shows an error that occurs while the panel is open, but not an earlier one', () => {
    vi.useFakeTimers();
    const {set} = renderCart({error: new Error('earlier')});
    openCart();
    expect(screen.queryByRole('alert')).toBeNull();

    act(() => set({error: new Error('boom')}));
    expect(screen.getByRole('alert')).toBeDefined();

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
