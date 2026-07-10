import type {Cart, CartItem, CartState} from '@coveo/headless/ssr-commerce';
import {adjustQuantity, emptyCart, purchase} from '../common/cart-actions.js';
import {escapeHtml, formatCurrency, getElement} from '../common/utils.js';

/**
 * The cart, presented as a slide-in drawer available on every page. The toggle
 * button (with an item-count badge) lives in the header; selecting it opens the
 * drawer, which lists each cart item with quantity controls plus purchase and
 * empty actions.
 *
 * Like the other components, this module owns both the server render and the
 * matching client hydration (see `client.ts`). Cart mutations flow through
 * `common/cart-actions.ts`.
 */

function itemCountLabel(count: number): string {
  return count === 1 ? '1 item' : `${count} items`;
}

/**
 * The header toggle button. Rendered as a slot passed to `renderHeader` so the
 * header stays decoupled from the cart. The badge is hidden when the cart is
 * empty.
 */
export function renderCartToggle(itemCount: number): string {
  return `
    <button type="button" id="cart-toggle" class="CartToggle" aria-haspopup="dialog" aria-controls="cart-drawer" aria-label="Cart, ${itemCountLabel(itemCount)}">
      <span class="CartToggleIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      </span>
      <span class="CartToggleLabel">Cart</span>
      <span id="cart-count" class="CartBadge"${itemCount > 0 ? '' : ' hidden'}>${itemCount}</span>
    </button>
  `;
}

function renderCartItem(item: CartItem, currency: string): string {
  const productId = escapeHtml(item.productId);
  const name = escapeHtml(item.name);
  return `
    <li class="CartItem" data-product-id="${productId}">
      <div class="CartItemMain">
        <span class="CartItemName">${name}</span>
        <span class="CartItemPrice">${formatCurrency(item.price, currency)} each</span>
      </div>
      <div class="CartItemControls">
        <button type="button" class="CartQtyButton" data-action="decrement" aria-label="Remove one ${name}">&minus;</button>
        <span class="CartItemQty" aria-label="Quantity">${item.quantity}</span>
        <button type="button" class="CartQtyButton" data-action="increment" aria-label="Add one ${name}">&plus;</button>
        <button type="button" class="CartItemRemove" data-action="remove" aria-label="Remove all ${name}">Remove</button>
      </div>
      <span class="CartItemTotal">${formatCurrency(item.price * item.quantity, currency)}</span>
    </li>
  `;
}

/** The drawer's inner content: the item list plus totals and actions. */
function renderCartBody(state: CartState, currency: string): string {
  if (state.items.length === 0) {
    return '<p class="CartEmpty">Your cart is empty.</p>';
  }

  const items = state.items
    .map((item) => renderCartItem(item, currency))
    .join('');

  return `
    <ul class="CartItems">${items}</ul>
    <div class="CartFooter">
      <div class="CartTotalRow">
        <span>Total</span>
        <span class="CartTotalValue">${formatCurrency(state.totalPrice, currency)}</span>
      </div>
      <div class="CartFooterActions">
        <button type="button" id="cart-purchase" class="CartPurchase">Purchase</button>
        <button type="button" id="cart-empty" class="CartEmptyButton">Empty cart</button>
      </div>
    </div>
  `;
}

/** The full drawer (overlay + panel), hidden until the toggle opens it. */
export function renderCart(state: CartState, currency: string): string {
  return `
    <div id="cart-drawer" class="CartDrawer" hidden>
      <button type="button" id="cart-overlay" class="CartOverlay" tabindex="-1" aria-label="Close cart"></button>
      <aside class="CartPanel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header class="CartPanelHeader">
          <h2 class="CartPanelTitle">Your cart</h2>
          <button type="button" id="cart-close" class="CartClose" aria-label="Close cart">&times;</button>
        </header>
        <div id="cart-body" class="CartBody">${renderCartBody(state, currency)}</div>
      </aside>
    </div>
  `;
}

export function hydrateCart(cart: Cart, currency: string) {
  const drawer = getElement<HTMLDivElement>('cart-drawer');
  const body = getElement<HTMLDivElement>('cart-body');
  if (!drawer || !body) {
    return;
  }

  const toggle = getElement<HTMLButtonElement>('cart-toggle');
  const closeButton = getElement<HTMLButtonElement>('cart-close');
  const overlay = getElement<HTMLButtonElement>('cart-overlay');
  const badge = getElement<HTMLSpanElement>('cart-count');

  const openCart = () => {
    drawer.hidden = false;
    closeButton?.focus();
  };
  const closeCart = () => {
    drawer.hidden = true;
    toggle?.focus();
  };

  toggle?.addEventListener('click', openCart);
  closeButton?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer.hidden) {
      closeCart();
    }
  });

  // Event delegation on the persistent body element keeps handlers stable
  // across re-renders (the body's innerHTML is replaced on every cart change).
  body.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) {
      return;
    }

    if (button.id === 'cart-purchase') {
      if (cart.state.items.length > 0) {
        purchase(cart, cart.state.totalPrice);
      }
      return;
    }
    if (button.id === 'cart-empty') {
      if (cart.state.items.length > 0) {
        emptyCart(cart);
      }
      return;
    }

    const action = button.dataset.action;
    if (!action) {
      return;
    }
    const productId =
      button.closest<HTMLLIElement>('.CartItem')?.dataset.productId;
    const item = cart.state.items.find((i) => i.productId === productId);
    if (!item) {
      return;
    }
    if (action === 'increment') {
      adjustQuantity(cart, item, 1);
    } else if (action === 'decrement') {
      adjustQuantity(cart, item, -1);
    } else if (action === 'remove') {
      adjustQuantity(cart, item, -item.quantity);
    }
  });

  const update = () => {
    const {totalQuantity} = cart.state;
    body.innerHTML = renderCartBody(cart.state, currency);
    if (badge) {
      badge.textContent = String(totalQuantity);
      badge.hidden = totalQuantity === 0;
    }
    toggle?.setAttribute(
      'aria-label',
      `Cart, ${itemCountLabel(totalQuantity)}`
    );
  };

  cart.subscribe(update);
  update();
}
