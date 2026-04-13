import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '@coveo/commerce-agent-chat-core/lib/commerceExtractor';
import {
  isSupportedType,
  normalizeType,
  isType,
  uniqueProducts,
} from '@coveo/commerce-agent-chat-core/lib/commerceHelpers';
import type {
  A2UISurfaceContent,
  BundleTierConfig,
  CatalogComponent,
  NextAction,
  Product,
} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-bundle-display.js';
import './cac-comparison-summary.js';
import './cac-comparison-table.js';
import './cac-next-actions-bar.js';
import './cac-product-carousel.js';

interface ProductSection {
  heading: string;
  products: Product[];
}

interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

interface BundleTierWithProducts extends Omit<BundleTierConfig, 'slots'> {
  slots: BundleSlotWithProduct[];
}

interface CatalogRenderContext {
  supportedComponents: CatalogComponent[];
  actionsBySurface: Map<string, NextAction[]>;
  allProducts: Product[];
  hasNextActionsComponent: boolean;
  getProducts: (surfaceId: string) => Product[];
}

interface ComponentRenderArgs {
  component: CatalogComponent;
  index: number;
  getProducts: (surfaceId: string) => Product[];
  allProducts: Product[];
  actionsBySurface: Map<string, NextAction[]>;
}

/**
 * The `cac-commerce-catalog-view` component renders supported commerce activities.
 */
@customElement('cac-commerce-catalog-view')
export class CacCommerceCatalogView extends LitElement {
  static override styles = css`
    .commerce-catalog {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  `;

  /** The A2UI surface content to render. */
  @property({attribute: false})
  public content: A2UISurfaceContent = {operations: []};

  /** Whether loading placeholders should be shown for empty content states. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  /** Accumulated products from all activities in the same message, used to resolve bundle surface references. */
  @property({attribute: false})
  public bundleProducts: Map<string, Product[]> = new Map();

  override render() {
    const context = this.buildRenderContext();
    if (context.supportedComponents.length === 0) {
      return nothing;
    }

    return html`
      <div class="commerce-catalog">
        ${map(context.supportedComponents, (component, index) =>
          this.renderComponent({
            component,
            index,
            getProducts: context.getProducts,
            allProducts: context.allProducts,
            actionsBySurface: context.actionsBySurface,
          })
        )}
        ${when(
          this.isLoading && !context.hasNextActionsComponent,
          () =>
            html`<cac-next-actions-bar
              .actions=${[]}
              .isLoading=${true}
            ></cac-next-actions-bar>`
        )}
      </div>
    `;
  }

  private buildRenderContext(): CatalogRenderContext {
    const operations = this.content?.operations ?? [];
    const productsBySurface = extractProductsBySurface(operations);

    const catalogComponents = extractCatalogComponents(operations);
    const supportedComponents =
      this.getLatestSupportedComponents(catalogComponents);

    return {
      supportedComponents,
      actionsBySurface: extractActionsBySurface(operations),
      allProducts: uniqueProducts(productsBySurface),
      hasNextActionsComponent: supportedComponents.some((component) =>
        isType(component.type, 'NextActionsBar')
      ),
      getProducts: (surfaceId: string) =>
        productsBySurface.get(surfaceId) ??
        this.bundleProducts.get(surfaceId) ??
        [],
    };
  }

  private getLatestSupportedComponents(components: CatalogComponent[]) {
    const latestByTypeAndSurface = new Map<string, CatalogComponent>();

    for (const component of components) {
      if (!isSupportedType(component.type)) {
        continue;
      }

      const key = `${normalizeType(component.type)}::${component.surfaceId}`;
      latestByTypeAndSurface.delete(key);
      latestByTypeAndSurface.set(key, component);
    }

    return Array.from(latestByTypeAndSurface.values());
  }

  private renderComponent({
    component,
    index,
    getProducts,
    allProducts,
    actionsBySurface,
  }: ComponentRenderArgs) {
    if (isType(component.type, 'ProductCarousel')) {
      return this.renderProductCarousel(component, index, getProducts);
    }

    if (isType(component.type, 'ComparisonTable')) {
      return this.renderComparisonTable(
        component,
        index,
        getProducts,
        allProducts
      );
    }

    if (isType(component.type, 'ComparisonSummary')) {
      return this.renderComparisonSummary(component, index);
    }

    if (isType(component.type, 'BundleDisplay')) {
      return this.renderBundleDisplay(component, index, getProducts);
    }

    if (isType(component.type, 'NextActionsBar')) {
      return this.renderNextActions(component, index, actionsBySurface);
    }

    return nothing;
  }

  private renderProductCarousel(
    component: CatalogComponent,
    index: number,
    getProducts: (surfaceId: string) => Product[]
  ) {
    const products = getProducts(component.surfaceId);
    const sections: ProductSection[] = [{heading: component.heading, products}];
    const inferredLoading = this.isLoading && products.length === 0;

    return html`
      <cac-product-carousel
        data-key=${`product-carousel-${index}`}
        .sections=${sections}
        .isLoading=${(component.isLoading ?? false) || inferredLoading}
      ></cac-product-carousel>
    `;
  }

  private renderComparisonTable(
    component: CatalogComponent,
    index: number,
    getProducts: (surfaceId: string) => Product[],
    allProducts: Product[]
  ) {
    const products = getProducts(component.surfaceId);
    const comparisonProducts = products.length > 0 ? products : allProducts;
    const inferredLoading = this.isLoading && comparisonProducts.length === 0;

    return html`
      <cac-comparison-table
        data-key=${`comparison-table-${index}`}
        .heading=${component.heading}
        .products=${comparisonProducts}
        .comparisonAttributes=${component.attributes ?? []}
        .isLoading=${(component.isLoading ?? false) || inferredLoading}
      ></cac-comparison-table>
    `;
  }

  private renderComparisonSummary(component: CatalogComponent, index: number) {
    return html`
      <cac-comparison-summary
        data-key=${`comparison-summary-${index}`}
        .text=${component.text ?? ''}
      ></cac-comparison-summary>
    `;
  }

  private renderBundleDisplay(
    component: CatalogComponent,
    index: number,
    getProducts: (surfaceId: string) => Product[]
  ) {
    const bundles = this.getBundleTiersWithProducts(component, getProducts);
    const inferredLoading =
      this.isLoading && !this.hasBundleSlotProduct(bundles);

    return html`
      <cac-bundle-display
        data-key=${`bundle-display-${index}`}
        .heading=${component.title ?? component.heading}
        .bundles=${bundles}
        .isLoading=${(component.isLoading ?? false) || inferredLoading}
      ></cac-bundle-display>
    `;
  }

  private renderNextActions(
    component: CatalogComponent,
    index: number,
    actionsBySurface: Map<string, NextAction[]>
  ) {
    const actions = actionsBySurface.get(component.surfaceId) ?? [];
    const inferredLoading = this.isLoading && actions.length === 0;

    return html`
      <cac-next-actions-bar
        data-key=${`next-actions-${index}`}
        .actions=${actions}
        .isLoading=${(component.isLoading ?? false) || inferredLoading}
      ></cac-next-actions-bar>
    `;
  }

  private getBundleTiersWithProducts(
    component: CatalogComponent,
    getProducts: (surfaceId: string) => Product[]
  ) {
    return (component.bundles ?? []).map((bundle) => ({
      ...bundle,
      slots: bundle.slots.map((slot) => {
        const surfaceRef = slot.surfaceRef.trim();
        return {
          ...slot,
          surfaceRef,
          product: getProducts(surfaceRef)[0] ?? null,
        };
      }),
    })) as BundleTierWithProducts[];
  }

  private hasBundleSlotProduct(bundles: BundleTierWithProducts[]) {
    return bundles.some((bundle) =>
      bundle.slots.some((slot) => slot.product !== null)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-commerce-catalog-view': CacCommerceCatalogView;
  }
}
