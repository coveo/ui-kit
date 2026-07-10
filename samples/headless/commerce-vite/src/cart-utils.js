/**
 * Persist the cart to local storage so it can be restored when the commerce
 * engine is initialized (see engine.js). The Commerce API is stateless about
 * the cart, so the front end owns its persistence.
 */

const STORAGE_KEY = 'coveo-cartState';

export function saveCartItemsToLocalStorage(cartState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState.items));
  } catch (err) {
    console.error('Failed to save cart items to local storage', err);
  }
}

export function loadCartItemsFromLocalStorage() {
  try {
    const items = window.localStorage.getItem(STORAGE_KEY);
    return items ? JSON.parse(items) : null;
  } catch (err) {
    console.error('Failed to load cart items from local storage', err);
    return null;
  }
}
