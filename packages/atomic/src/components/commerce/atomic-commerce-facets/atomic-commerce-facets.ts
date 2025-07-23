import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildProductListing,
  buildSearch,
  type FacetGenerator,
  type Summary,
} from '@coveo/headless/commerce';
import type {
  RegularFacet,
  CategoryFacet,
  DateFacet,
  NumericFacet,
  FacetGeneratorState,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {provide} from '@lit/context';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '../../common/interface/store';
import '../atomic-commerce-category-facet/atomic-commerce-category-facet';
import '../atomic-commerce-facet/atomic-commerce-facet';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-commerce-numeric-facet/atomic-commerce-numeric-facet';
import '../atomic-commerce-timeframe-facet/atomic-commerce-timeframe-facet';
import {commerceContext, type CommerceContext} from '../commerce-context';

/**
 * The `atomic-commerce-facets` component automatically renders commerce facets based on the Commerce API response.
 * Unlike regular facets, which require explicit definition and request in the query, the `atomic-commerce-facets` component dynamically generates facets.
 *
 * @alpha
 */
@customElement('atomic-commerce-facets')
@bindings()
@withTailwindStyles
export class AtomicCommerceFacets
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  @state() error!: Error;

  public facetGenerator!: FacetGenerator;
  public summary!: Summary<SearchSummaryState | ProductListingSummaryState>;

  // TODO: try to use the commerce Context values if it is easier
  @provide({context: commerceContext})
  public commerceContextValue!: CommerceContext;

  /**
   * The maximum number of facets to expand.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   * Using the value `-1` disables the feature and keeps all facets expanded.
   */
  @property({reflect: true, attribute: 'collapse-facets-after', type: Number})
  public collapseFacetsAfter = 4;

  @bindStateToController('facetGenerator')
  @state()
  public facetGeneratorState!: FacetGeneratorState;

  @state() private isAppLoaded = false;

  public initialize() {
    this.validateProps();
    const {engine} = this.bindings;
    const controller = this.controllerBuilder(engine);
    this.facetGenerator = controller.facetGenerator();
    this.summary = controller.summary();

    // Provide context to child components
    this.commerceContextValue = {
      summary: this.summary,
      facetGenerator: this.facetGenerator,
    };

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  createRenderRoot() {
    return this;
  }

  private isProductListing() {
    return this.bindings.interfaceElement.type === 'product-listing';
  }

  private get controllerBuilder() {
    return this.isProductListing() ? buildProductListing : buildSearch;
  }

  private validateProps() {
    new Schema({
      collapseFacetAfter: new NumberValue({min: -1, required: true}),
    }).validate({
      collapseFacetAfter: this.collapseFacetsAfter,
    });
  }

  private shouldCollapseFacet(index: number): boolean {
    if (this.collapseFacetsAfter === -1) {
      return false;
    }
    return this.collapseFacetsAfter
      ? index + 1 > this.collapseFacetsAfter
      : true;
  }

  // TODO: create Placeholder render function
  private renderFacetPlaceholders() {
    const placeholderCount =
      this.collapseFacetsAfter > 0 ? this.collapseFacetsAfter : 4;
    const placeholders = Array.from({length: placeholderCount});

    return map(
      placeholders,
      () => html`
        <div
          part="placeholder"
          class="bg-background border-neutral mb-4 animate-pulse rounded-lg border p-7"
          aria-hidden="true"
        >
          <div class="bg-neutral h-8 rounded" style="width: 75%;"></div>
          <div class="mt-7">
            ${map(
              Array.from({length: 8}),
              () => html`
                <div
                  class="bg-neutral mt-4 flex h-5"
                  style="width: 100%; opacity: 0.5;"
                ></div>
              `
            )}
          </div>
        </div>
      `
    );
  }

  private renderFacets() {
    return map(this.facetGenerator.facets, (facet, index) => {
      if (facet.state.values.length === 0) {
        return nothing;
      }

      const isCollapsed = this.shouldCollapseFacet(index);

      // TODO: find a way to avoid passing complex objects
      switch (facet.state.type) {
        case 'regular':
          return html`<atomic-commerce-facet
            .isCollapsed=${isCollapsed}
            .summary=${this.summary}
            .facet=${facet as RegularFacet}
            .field=${facet.state.field}
          ></atomic-commerce-facet>`;
        case 'numericalRange':
          return html`<atomic-commerce-numeric-facet
            .isCollapsed=${isCollapsed}
            .summary=${this.summary}
            .facet=${facet as NumericFacet}
            .field=${facet.state.field}
          ></atomic-commerce-numeric-facet>`;
        case 'dateRange':
          return html`<atomic-commerce-timeframe-facet
            .isCollapsed=${isCollapsed}
            .summary=${this.summary}
            .facet=${facet as DateFacet}
            .field=${facet.state.field}
          ></atomic-commerce-timeframe-facet>`;
        case 'hierarchical':
          return html`<atomic-commerce-category-facet
            .isCollapsed=${isCollapsed}
            .summary=${this.summary}
            .facet=${facet as CategoryFacet}
            .field=${facet.state.field}
          ></atomic-commerce-category-facet>`;
        default: {
          // TODO COMHUB-291 support location facet
          this.bindings.engine.logger.warn('Unexpected facet type.');
          return nothing;
        }
      }
    });
  }

  render() {
    return when(
      this.isAppLoaded,
      () => this.renderFacets(),
      () => this.renderFacetPlaceholders()
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-facets': AtomicCommerceFacets;
  }
}
