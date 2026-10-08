import {
  buildProductEnrichment,
  type CommerceEngine,
  type ProductEnrichmentState,
} from '@coveo/headless/commerce';

/**
 * Merchandiser-managed badges ("Best seller", "New") for one product, fetched
 * with the Headless `ProductEnrichment` controller. Atomic has no component that
 * fetches badges; `atomic-product-section-badges` is only a layout slot.
 *
 * Set `placement-ids` to the badge placements configured in the Merchandising
 * Hub, separated by spaces.
 */
export class ProductBadges extends HTMLElement {
  #unsubscribe?: () => void;

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  initialize(engine: CommerceEngine, productId: string) {
    const placementIds = (this.getAttribute('placement-ids') ?? '').split(/\s+/).filter(Boolean);
    const enrichment = buildProductEnrichment(engine, {options: {productId, placementIds}});

    this.#unsubscribe = enrichment.subscribe(() => this.#render(enrichment.state));
    enrichment.getBadges();
  }

  #render({products}: ProductEnrichmentState) {
    const badges = products
      .flatMap(({badgePlacements}) => badgePlacements)
      .flatMap(({badges}) => badges);

    this.replaceChildren(
      ...badges.map(({text, backgroundColor, textColor, iconUrl}) => {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.style.backgroundColor = backgroundColor;
        badge.style.color = textColor;

        if (iconUrl) {
          const icon = document.createElement('img');
          icon.src = iconUrl;
          icon.alt = '';
          icon.width = 16;
          icon.height = 16;
          badge.append(icon);
        }
        badge.append(text);
        return badge;
      })
    );
  }
}

customElements.define('product-badges', ProductBadges);

declare global {
  interface HTMLElementTagNameMap {
    'product-badges': ProductBadges;
  }
}
