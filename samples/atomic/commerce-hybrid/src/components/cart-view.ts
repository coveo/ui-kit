import {buildCart, type Cart, type CartItem, type CommerceEngine} from '@coveo/headless/commerce';
import {announce} from '../aria-live.js';
import {placeOrder, setQuantity} from '../cart.js';
import {priceFormatter} from '../engine.js';

/**
 * The cart page body: line items with quantity controls, the total, and a
 * "Place order" button. Built with the Headless `Cart` controller, since Atomic
 * has no cart component.
 */
export class CartView extends HTMLElement {
  #engine?: CommerceEngine;
  #cart?: Cart;
  #formatPrice: (price: number) => string = String;
  #confirmation = '';
  #unsubscribe?: () => void;

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  initialize(engine: CommerceEngine) {
    this.#engine = engine;
    this.#cart = buildCart(engine);
    this.#formatPrice = priceFormatter(engine);
    this.#unsubscribe = this.#cart.subscribe(() => this.#render());
  }

  #render() {
    const {items, totalPrice} = this.#cart!.state;

    // Every change re-renders the list, so focus is put back on the control the
    // shopper was using; otherwise keyboard and screen-reader users lose their place.
    const focused = this.querySelector<HTMLElement>(':focus')?.dataset.focusKey;

    if (items.length === 0) {
      const message = document.createElement('p');
      message.className = 'cart-view__empty';
      message.textContent = this.#confirmation || 'Your cart is empty.';
      this.replaceChildren(message);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'cart-view__items';
    list.append(...items.map((item) => this.#renderItem(item)));

    const total = document.createElement('p');
    total.className = 'cart-view__total';
    total.textContent = `Total: ${this.#formatPrice(totalPrice)}`;

    const order = document.createElement('button');
    order.type = 'button';
    order.className = 'cart-view__order';
    order.textContent = 'Place order';
    order.addEventListener('click', () => this.#placeOrder());

    this.replaceChildren(list, total, order);

    if (focused) {
      this.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focused)}"]`)?.focus();
    }
  }

  #renderItem(item: CartItem) {
    const row = document.createElement('li');
    row.className = 'cart-view__item';

    const name = document.createElement('span');
    name.className = 'cart-view__name';
    name.textContent = item.name;

    const quantity = document.createElement('span');
    quantity.className = 'cart-view__quantity';
    quantity.append(
      this.#button('−', `Decrease quantity of ${item.name}`, `decrease:${item.productId}`, () =>
        this.#change(item, item.quantity - 1)
      ),
      document.createTextNode(String(item.quantity)),
      this.#button('+', `Increase quantity of ${item.name}`, `increase:${item.productId}`, () =>
        this.#change(item, item.quantity + 1)
      )
    );

    const price = document.createElement('span');
    price.className = 'cart-view__price';
    price.textContent = this.#formatPrice(item.price * item.quantity);

    const remove = this.#button('Remove', `Remove ${item.name} from cart`, '', () =>
      this.#change(item, 0)
    );

    row.append(name, quantity, price, remove);
    return row;
  }

  #button(text: string, label: string, focusKey: string, onClick: () => void) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    if (focusKey) {
      button.dataset.focusKey = focusKey;
    }
    button.addEventListener('click', onClick);
    return button;
  }

  async #change(item: CartItem, quantity: number) {
    this.#confirmation = '';
    await setQuantity(this.#engine!, {...item, quantity});
    announce(
      quantity === 0 ? `${item.name} removed from cart.` : `${item.name} quantity ${quantity}.`
    );
  }

  async #placeOrder() {
    // Set before the purchase: emptying the cart re-renders synchronously.
    this.#confirmation = 'Thank you, your order is placed.';
    await placeOrder(this.#engine!);
    announce(this.#confirmation);
  }
}

customElements.define('cart-view', CartView);

declare global {
  interface HTMLElementTagNameMap {
    'cart-view': CartView;
  }
}
