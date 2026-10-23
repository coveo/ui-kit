import {describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {StorefrontSessionProvider, useCart} from '../../session/storefront-session.js';
import {AddToCartButton} from './AddToCartButton.js';

const product = {productId: 'p-1', name: 'Life jacket', price: 30};

function AddOneThroughTheCart() {
  const {cart} = useCart();
  return (
    <AddToCartButton
      product={product}
      onAdd={(added) =>
        cart.apply({...added, price: added.price ?? null, quantity: 1, operation: 'add'})
      }
    />
  );
}

describe('AddToCartButton', () => {
  it('hands its product to onAdd', () => {
    const onAdd = vi.fn();
    render(
      <StorefrontSessionProvider>
        <AddToCartButton product={product} onAdd={onAdd} />
      </StorefrontSessionProvider>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Add Life jacket to cart'}));

    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('says how many of the product the cart already holds', () => {
    render(
      <StorefrontSessionProvider>
        <AddOneThroughTheCart />
      </StorefrontSessionProvider>
    );
    const button = screen.getByRole('button', {name: 'Add Life jacket to cart'});
    expect(button.textContent).toBe('Add to cart');

    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
    });

    expect(button.textContent).toBe('Add · 2 in cart');
  });
});
