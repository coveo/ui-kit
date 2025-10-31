import {NumberValue, Schema} from '@coveo/bueno';
import type {
  CategoryFacet,
  DateFacet,
  NumericFacet,
  ProductListingSummaryState,
  RegularFacet,
  SearchSummaryState,
} from '@coveo/headless/commerce';
import {
  buildProductListing,
  buildSearch,
  type FacetGenerator,
  type Summary,
} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import '../../common/atomic-facet-placeholder/atomic-facet-placeholder';
import {createAppLoadedListener} from '../../common/interface/store';
import '../atomic-commerce-category-facet/atomic-commerce-category-facet';
import '../atomic-commerce-facet/atomic-commerce-facet';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-commerce-numeric-facet/atomic-commerce-numeric-facet';
import '../atomic-commerce-timeframe-facet/atomic-commerce-timeframe-facet';
import type {
  FacetType,
  MappedGeneratedFacetController,
} from '@coveo/headless/commerce';
import {keyed} from 'lit/directives/keyed.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-commerce-facets` component automatically renders commerce facets based on the Commerce API response.
 * Unlike regular facets, which require explicit definition and request in the query, the `atomic-commerce-facets` component dynamically generates facets.
 */
@customElement('atomic-commerce-facets')
@bindings()
export class AtomicCommerceFacets
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  @state() error!: Error;

  @bindStateToController('facetGenerator')
  @state()
  public facetGeneratorState!: string[];

  public facetGenerator!: FacetGenerator;
  public summary!: Summary<SearchSummaryState | ProductListingSummaryState>;

  /**
   * The maximum number of facets to expand.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   * Using the value `-1` disables the feature and keeps all facets expanded.
   */
  @property({reflect: true, attribute: 'collapse-facets-after', type: Number})
  public collapseFacetsAfter = 4;

  @state() private isAppLoaded = false;

  public initialize() {
    this.validateProps();
    const controller = this.controllerBuilder(this.bindings.engine);
    this.facetGenerator = controller.facetGenerator();
    this.summary = controller.summary();
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private isProductListing() {
    return this.bindings.interfaceElement.type === 'product-listing';
  }

  private get controllerBuilder() {
    return this.isProductListing() ? buildProductListing : buildSearch;
  }

  private validateProps() {
    new Schema({
      collapseFacetsAfter: new NumberValue({min: -1, required: true}),
    }).validate({
      collapseFacetsAfter: this.collapseFacetsAfter,
    });
  }

  private shouldCollapseFacet(
    index: number,
    facet: MappedGeneratedFacetController[FacetType]
  ): boolean {
    if (this.collapseFacetsAfter === -1 || facet.state.hasActiveValues) {
      return false;
    }
    return this.collapseFacetsAfter
      ? index + 1 > this.collapseFacetsAfter
      : true;
  }

  private renderFacetPlaceholders() {
    return map(
      Array.from({length: this.collapseFacetsAfter}),
      () =>
        html`<atomic-facet-placeholder
            value-count="8"
          ></atomic-facet-placeholder>`
    );
  }

  private renderFacets() {
    return map(this.facetGenerator.facets, (facet, index) => {
      if (facet.state.values.length === 0) {
        return nothing;
      }

      const isCollapsed = this.shouldCollapseFacet(index, facet);

      switch (facet.state.type) {
        case 'regular':
          return html`${keyed(
            facet.state.facetId,
            html`
              <atomic-commerce-facet
                .isCollapsed=${isCollapsed}
                .summary=${this.summary}
                .facet=${facet as RegularFacet}
                .field=${facet.state.field}
              ></atomic-commerce-facet>
            `
          )} `;
        case 'numericalRange':
          return html`${keyed(
            facet.state.facetId,
            html`<atomic-commerce-numeric-facet
              .isCollapsed=${isCollapsed}
              .summary=${this.summary}
              .facet=${facet as NumericFacet}
              .field=${facet.state.field}
            ></atomic-commerce-numeric-facet>`
          )}`;
        case 'dateRange':
          return html`${keyed(
            facet.state.facetId,
            html`<atomic-commerce-timeframe-facet
              .isCollapsed=${isCollapsed}
              .summary=${this.summary}
              .facet=${facet as DateFacet}
              .field=${facet.state.field}
            ></atomic-commerce-timeframe-facet>`
          )}`;
        case 'hierarchical':
          return html`${keyed(
            facet.state.facetId,
            html`<atomic-commerce-category-facet
              .isCollapsed=${isCollapsed}
              .summary=${this.summary}
              .facet=${facet as CategoryFacet}
              .field=${facet.state.field}
            ></atomic-commerce-category-facet>`
          )}`;
        default: {
          // TODO COMHUB-291 support location facet
          this.bindings.engine.logger.warn('Unexpected facet type.');
          return nothing;
        }
      }
    });
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(
      this.isAppLoaded,
      () => this.renderFacets(),
      () => this.renderFacetPlaceholders()
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-facets': AtomicCommerceFacets;
  }
}
