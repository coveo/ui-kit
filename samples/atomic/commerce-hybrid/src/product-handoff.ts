import type {Product} from '@coveo/headless/commerce';

/**
 * Simulates the product data a real storefront already has on its product page.
 *
 * On Shopify, Salesforce Commerce Cloud, and similar platforms, the product page
 * is rendered by the platform, which knows the product's name and price. This
 * sample has no product database, so the product is handed over from the card
 * the shopper clicked. Remove this file when you port the product page to your
 * platform.
 *
 * `atomic-product-link`'s `href-template` can only interpolate string fields, so
 * the price cannot travel in the URL; only the id does (see the templates).
 */

const storageKey = 'coveo-hybrid-sample-product';

/**
 * Remembers the product of any `atomic-product` card the shopper clicks.
 *
 * Product cards render in shadow DOM, so the card is found in the click's
 * composed path. The listener runs in the capture phase, before the card's link
 * navigates away.
 */
export function rememberClickedProducts() {
  document.addEventListener(
    'click',
    (event) => {
      const card = event
        .composedPath()
        .find(
          (target): target is HTMLElementTagNameMap['atomic-product'] =>
            target instanceof HTMLElement && target.localName === 'atomic-product'
        );

      if (card?.product) {
        localStorage.setItem(storageKey, JSON.stringify(card.product));
      }
    },
    {capture: true}
  );
}

export function getHandedOffProduct(permanentid: string): Product | null {
  try {
    const product: Product | null = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    return product?.permanentid === permanentid ? product : null;
  } catch {
    return null;
  }
}
