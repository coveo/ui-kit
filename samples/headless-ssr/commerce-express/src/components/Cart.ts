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

/**
 * Client-side DOM builders for the cart body.
 *
 * The cart is seeded from a user-controlled cookie (see `lib/cart.ts`), so on
 * the client the drawer contents are built with the DOM API — untrusted fields
 * (`name`, `productId`) go through `textContent`/`dataset`, never
 * string-interpolated HTML assigned with `innerHTML`. This keeps the re-render
 * free of any HTML-injection sink. The server render (`renderCart`) escapes the
 * same fields with `escapeHtml` for the equivalent reason.
 */
function buildQtyButton(
  action: 'increment' | 'decrement',
  label: string,
  glyph: string
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'CartQtyButton';
  button.dataset.action = action;
  button.setAttribute('aria-label', label);
  button.textContent = glyph;
  return button;
}

function buildCartItemNode(item: CartItem, currency: string): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'CartItem';
  li.dataset.productId = item.productId;

  const main = document.createElement('div');
  main.className = 'CartItemMain';
  const name = document.createElement('span');
  name.className = 'CartItemName';
  name.textContent = item.name;
  const price = document.createElement('span');
  price.className = 'CartItemPrice';
  price.textContent = `${formatCurrency(item.price, currency)} each`;
  main.append(name, price);

  const controls = document.createElement('div');
  controls.className = 'CartItemControls';
  const decrement = buildQtyButton(
    'decrement',
    `Remove one ${item.name}`,
    '\u2212'
  );
  const quantity = document.createElement('span');
  quantity.className = 'CartItemQty';
  quantity.setAttribute('aria-label', 'Quantity');
  quantity.textContent = String(item.quantity);
  const increment = buildQtyButton('increment', `Add one ${item.name}`, '+');
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'CartItemRemove';
  remove.dataset.action = 'remove';
  remove.setAttribute('aria-label', `Remove all ${item.name}`);
  remove.textContent = 'Remove';
  controls.append(decrement, quantity, increment, remove);

  const total = document.createElement('span');
  total.className = 'CartItemTotal';
  total.textContent = formatCurrency(item.price * item.quantity, currency);

  li.append(main, controls, total);
  return li;
}

/** Builds the drawer's inner content (item list + totals/actions) as DOM nodes. */
function buildCartBodyNode(
  state: CartState,
  currency: string
): DocumentFragment {
  const fragment = document.createDocumentFragment();

  if (state.items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'CartEmpty';
    empty.textContent = 'Your cart is empty.';
    fragment.append(empty);
    return fragment;
  }

  const list = document.createElement('ul');
  list.className = 'CartItems';
  for (const item of state.items) {
    list.append(buildCartItemNode(item, currency));
  }

  const footer = document.createElement('div');
  footer.className = 'CartFooter';

  const totalRow = document.createElement('div');
  totalRow.className = 'CartTotalRow';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Total';
  const totalValue = document.createElement('span');
  totalValue.className = 'CartTotalValue';
  totalValue.textContent = formatCurrency(state.totalPrice, currency);
  totalRow.append(totalLabel, totalValue);

  const actions = document.createElement('div');
  actions.className = 'CartFooterActions';
  const purchase = document.createElement('button');
  purchase.type = 'button';
  purchase.id = 'cart-purchase';
  purchase.className = 'CartPurchase';
  purchase.textContent = 'Purchase';
  const emptyButton = document.createElement('button');
  emptyButton.type = 'button';
  emptyButton.id = 'cart-empty';
  emptyButton.className = 'CartEmptyButton';
  emptyButton.textContent = 'Empty cart';
  actions.append(purchase, emptyButton);

  footer.append(totalRow, actions);
  fragment.append(list, footer);
  return fragment;
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
  // across re-renders (the body's children are replaced on every cart change).
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
    body.replaceChildren(buildCartBodyNode(cart.state, currency));
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
