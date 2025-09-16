import type {CartItemWithMetadata, CartState} from '@coveo/headless/commerce';

export function saveCartItemsToLocaleStorage(cartState: CartState): void {
  try {
    window.localStorage.setItem(
      'coveo-cartState',
      JSON.stringify(cartState.items)
    );
  } catch (err) {
    console.error('Failed to save cart items to local storage', err);
  }
}

export function loadCartItemsFromLocalStorage(): CartItemWithMetadata[] | null {
  try {
    const cartItems = window.localStorage.getItem('coveo-cartState');
    return cartItems ? JSON.parse(cartItems) : null;
  } catch (err) {
    console.error('Failed to load cart items from local storage', err);
    return null;
  }
}
