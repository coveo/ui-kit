import {describe, expect, it, vi} from 'vitest';
import {createCartStore} from './cart-store.js';

const item = {productId: 'p-1', name: 'Life jacket', price: 30};

describe('createCartStore', () => {
  it('adds a product, then increases its quantity', () => {
    const cart = createCartStore();
    cart.apply({...item, quantity: 1, operation: 'add'});
    cart.apply({...item, quantity: 2, operation: 'add'});

    expect(cart.getItems()).toEqual([{...item, quantity: 3}]);
  });

  it('sets a quantity', () => {
    const cart = createCartStore([{...item, quantity: 3}]);
    cart.apply({...item, quantity: 1, operation: 'setQuantity'});

    expect(cart.getItems()).toEqual([{...item, quantity: 1}]);
  });

  it('removes a product once its whole quantity is removed', () => {
    const cart = createCartStore([{...item, quantity: 2}]);
    cart.apply({...item, quantity: 1, operation: 'remove'});
    expect(cart.getItems()).toEqual([{...item, quantity: 1}]);

    cart.apply({...item, quantity: 1, operation: 'remove'});
    expect(cart.getItems()).toEqual([]);
  });

  it('notifies its listeners', () => {
    const cart = createCartStore();
    const listener = vi.fn();
    const unsubscribe = cart.subscribe(listener);

    cart.apply({...item, quantity: 1, operation: 'add'});
    unsubscribe();
    cart.apply({...item, quantity: 1, operation: 'add'});

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
