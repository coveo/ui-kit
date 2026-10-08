import {buildCart, type CommerceEngine} from '@coveo/headless/commerce';

/**
 * A header link to the cart page showing the number of items in the cart, read
 * from the Headless `Cart` controller.
 *
 * It sits outside every Atomic interface, so it cannot discover the engine on its
 * own; the page passes it in.
 */
export class MiniCart extends HTMLElement {
  #link = document.createElement('a');
  #count = document.createElement('span');
  #unsubscribe?: () => void;

  connectedCallback() {
    this.#link.href = '/cart.html';
    this.#link.className = 'mini-cart__link';
    this.#count.className = 'mini-cart__count';
    this.#link.replaceChildren('Cart', this.#count);
    this.append(this.#link);
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  initialize(engine: CommerceEngine) {
    const cart = buildCart(engine);
    this.#unsubscribe = cart.subscribe(() => {
      const {totalQuantity} = cart.state;
      this.#count.textContent = String(totalQuantity);
      this.#link.setAttribute(
        'aria-label',
        `Cart, ${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`
      );
    });
  }
}

customElements.define('mini-cart', MiniCart);

declare global {
  interface HTMLElementTagNameMap {
    'mini-cart': MiniCart;
  }
}
