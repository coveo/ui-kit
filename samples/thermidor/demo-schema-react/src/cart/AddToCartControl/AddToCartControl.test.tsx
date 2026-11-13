import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {cartWith, createFakeCartStore, type FakeCartStore} from '../../test/fake-cart-store.js';
import {CartProvider} from '../CartProvider.js';
import {AddToCartControl, type AddToCartControlProduct} from './AddToCartControl.js';

const WAX: AddToCartControlProduct = {
  productId: 'wax',
  name: 'Surf wax',
  imageUrl: 'https://example.com/wax.png',
  clickUri: 'https://example.com/wax',
  unitPrice: 4.5,
};

function renderControl(store: FakeCartStore, product = WAX, onParentClick = vi.fn()) {
  render(
    <CartProvider store={store}>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={onParentClick} onKeyDown={onParentClick}>
        <AddToCartControl product={product} />
      </div>
    </CartProvider>
  );
  return onParentClick;
}

describe('AddToCartControl', () => {
  it('offers to add a product that is not in the cart', () => {
    const store = createFakeCartStore({cart: cartWith({productId: 'board', quantity: 1})});
    renderControl(store);

    const button = screen.getByRole('button', {name: 'Add to cart, Surf wax'});
    expect(button.textContent).toBe('Add to cart');

    fireEvent.click(button);

    expect(store.add).toHaveBeenCalledWith(WAX, 1);
  });

  it('shows a stepper with the quantity once the product is in the cart', () => {
    const store = createFakeCartStore({cart: cartWith({productId: 'wax', quantity: 3})});
    renderControl(store);

    expect(screen.queryByRole('button', {name: 'Add to cart, Surf wax'})).toBeNull();
    expect(screen.getByRole('group', {name: 'Quantity of Surf wax'}).textContent).toContain(
      '3 in cart'
    );

    fireEvent.click(screen.getByRole('button', {name: 'Add one more Surf wax to cart'}));
    expect(store.add).toHaveBeenCalledWith(WAX, 1);

    fireEvent.click(screen.getByRole('button', {name: 'Remove one Surf wax from cart'}));
    expect(store.remove).toHaveBeenCalledWith('wax', 1);
  });

  it('moves focus to + after the first add, and back to "Add to cart" after the last removal', () => {
    const store = createFakeCartStore();
    renderControl(store);

    fireEvent.click(screen.getByRole('button', {name: 'Add to cart, Surf wax'}));
    act(() => store.set({cart: cartWith({productId: 'wax', quantity: 1})}));
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Add one more Surf wax to cart'})
    );

    fireEvent.click(screen.getByRole('button', {name: 'Remove one Surf wax from cart'}));
    act(() => store.set({cart: cartWith()}));
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Add to cart, Surf wax'})
    );
  });
  it('leaves focus alone when an add fails and the product enters the cart later', async () => {
    const store = createFakeCartStore();
    renderControl(store);

    fireEvent.click(screen.getByRole('button', {name: 'Add to cart, Surf wax'}));
    await act(async () => {});
    act(() => store.set({cart: cartWith({productId: 'wax', quantity: 1})}));

    expect(document.activeElement).toBe(document.body);
  });

  it('does not take focus back once it has moved out of the control', async () => {
    const store = createFakeCartStore();
    let settle = () => {};
    store.add.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          settle = () => {
            store.set({cart: cartWith({productId: 'wax', quantity: 1})});
            resolve();
          };
        })
    );
    render(
      <CartProvider store={store}>
        <input aria-label="Search" />
        <AddToCartControl product={WAX} />
      </CartProvider>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Add to cart, Surf wax'}));
    const search = screen.getByRole('textbox', {name: 'Search'});
    search.focus();
    await act(async () => settle());

    expect(document.activeElement).toBe(search);
  });

  it('is disabled while the product has a request in flight', () => {
    const store = createFakeCartStore({
      cart: cartWith({productId: 'wax', quantity: 2}),
      pendingProductIds: new Set(['wax', 'board']),
    });
    renderControl(store);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
      fireEvent.click(button);
    }
    expect(store.add).not.toHaveBeenCalled();
    expect(store.remove).not.toHaveBeenCalled();

    act(() => store.set({pendingProductIds: new Set(['board'])}));

    for (const button of screen.getAllByRole('button')) {
      expect(button.getAttribute('aria-disabled')).toBe('false');
    }
  });

  it('renders nothing for a product without a price', () => {
    const store = createFakeCartStore();
    renderControl(store, {...WAX, unitPrice: undefined});

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('lets other keys, such as Escape, reach the surrounding popover', () => {
    const onParentKeyDown = renderControl(createFakeCartStore());

    fireEvent.keyDown(screen.getByRole('button', {name: 'Add to cart, Surf wax'}), {key: 'Escape'});

    expect(onParentKeyDown).toHaveBeenCalledOnce();
  });
  it('keeps clicks, mouse presses and Enter/Space inside, even within a link', () => {
    const store = createFakeCartStore();
    const onParent = vi.fn();
    render(
      <CartProvider store={store}>
        <a
          href="https://example.com/wax"
          onClick={onParent}
          onMouseDown={onParent}
          onKeyDown={onParent}
        >
          <AddToCartControl product={WAX} />
        </a>
      </CartProvider>
    );
    const button = screen.getByRole('button', {name: 'Add to cart, Surf wax'});

    expect(fireEvent.mouseDown(button)).toBe(false);
    expect(fireEvent.click(button)).toBe(false);
    fireEvent.keyDown(button, {key: 'Enter'});
    fireEvent.keyDown(button, {key: ' '});

    expect(onParent).not.toHaveBeenCalled();
    expect(store.add).toHaveBeenCalledWith(WAX, 1);
  });
});
