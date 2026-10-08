import {type CommerceBindings, fetchProductContext, initializeBindings} from '@coveo/atomic';
import {buildCart, type CommerceEngine, type Product} from '@coveo/headless/commerce';
import {announce} from '../aria-live.js';
import {addOne, toCartItem} from '../cart.js';

// Atomic renders product templates inside each `atomic-product`'s shadow root, so
// page stylesheets never reach this element. It carries its own styles, and picks
// up the Atomic theme through its CSS custom properties, which do inherit into
// shadow DOM.
const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host { display: block; }
  button {
    width: 100%;
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--atomic-primary);
    border-radius: var(--atomic-border-radius-md);
    background: var(--atomic-primary);
    color: var(--atomic-on-primary);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover:not(:disabled) { background: var(--atomic-primary-dark); }
  button:focus-visible { outline: 2px solid var(--atomic-primary); outline-offset: 2px; }
  button:disabled { opacity: 0.6; cursor: progress; }
  .count { font-weight: 400; }
`);

/**
 * An add-to-cart button built with the Headless `Cart` controller.
 *
 * Atomic has no cart component, so this *extends* the storefront rather than
 * replacing anything. It works in two places:
 *
 * - Inside an `atomic-product-template`: it asks the surrounding `atomic-product`
 *   for its product and the surrounding Atomic interface for the engine, through
 *   the public `fetchProductContext` and `initializeBindings` helpers. Nothing
 *   needs to be passed in.
 * - Anywhere else (the product page): the page calls `initialize()`.
 *
 * Template markup is copied into each card as HTML, so only attributes survive;
 * properties and listeners set on the template are lost.
 */
export class AddToCartButton extends HTMLElement {
  #engine?: CommerceEngine;
  #product?: Product;
  #button = document.createElement('button');
  #unsubscribe?: () => void;

  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.adoptedStyleSheets = [styles];

    this.#button.type = 'button';
    this.#button.disabled = true;
    this.#button.textContent = 'Add to cart';
    this.#button.addEventListener('click', (event) => this.#onClick(event));
    shadow.append(this.#button);
  }

  async connectedCallback() {
    if (!this.#isInProductCard()) {
      return;
    }
    const [product, bindings] = await Promise.all([
      fetchProductContext(this),
      initializeBindings<CommerceBindings>(this),
    ]);
    this.initialize(bindings.engine, product);
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  initialize(engine: CommerceEngine, product: Product) {
    this.#engine = engine;
    this.#product = product;

    const item = toCartItem(product);
    this.#button.setAttribute('aria-label', `Add ${item.name} to cart`);
    this.#button.disabled = false;

    // The quantity comes from the engine's cart state, so it stays in sync with
    // every other cart control on the page (mini-cart, other cards).
    const cart = buildCart(engine);
    this.#unsubscribe?.();
    this.#unsubscribe = cart.subscribe(() => {
      const quantity =
        cart.state.items.find(({productId}) => productId === item.productId)?.quantity ?? 0;
      this.#render(quantity);
    });
  }

  #isInProductCard() {
    const root = this.getRootNode();
    return root instanceof ShadowRoot && root.host.localName === 'atomic-product';
  }

  #render(quantity: number) {
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = quantity > 0 ? ` (${quantity} in cart)` : '';
    this.#button.replaceChildren('Add to cart', count);
  }

  async #onClick(event: MouseEvent) {
    // In grid display, `atomic-product` opens the product on any click inside the
    // card. Stopping the click here keeps the shopper on the page.
    event.stopPropagation();

    if (!this.#engine || !this.#product) {
      return;
    }

    const item = toCartItem(this.#product);
    this.#button.disabled = true;
    await addOne(this.#engine, item);
    this.#button.disabled = false;
    announce(`${item.name} added to cart.`);
  }
}

customElements.define('add-to-cart-button', AddToCartButton);

declare global {
  interface HTMLElementTagNameMap {
    'add-to-cart-button': AddToCartButton;
  }
}
