import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {NumberValue, Schema} from '@coveo/bueno';
import {
  RegularFacet,
  buildProductListing,
  buildSearch,
  FacetGenerator,
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {createAppLoadedListener} from '../../../common/interface/store';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-commerce-facet/atomic-commerce-facet';

@customElement('atomic-commerce-facets')
export class AtomicCommerceFacets
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @property({type: Object}) bindings!: CommerceBindings;

  @property({type: Number, reflect: true})
  public collapseFacetsAfter = 4;

  @state() private facetGenerator!: FacetGenerator;
  @state() private summary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;

  @state() public error!: Error;
  @state() private isAppLoaded = false;

  initialize() {
    this.validateProps();
    const {engine} = this.bindings;
    const controller = this.controllerBuilder(engine);
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

  private shouldCollapseFacet(index: number): boolean {
    if (this.collapseFacetsAfter === -1) {
      return false;
    }
    return this.collapseFacetsAfter
      ? index + 1 > this.collapseFacetsAfter
      : true;
  }

  @errorGuard()
  // @bindingGuard() // TODO: understand why this is triggered 4 time with 3 times with the same binding value (i think) and why it would be needed
  protected render() {
    if (!this.isAppLoaded) {
      return html`
        ${map(
          Array.from({length: this.collapseFacetsAfter}),
          () => html`TODO: add placeholder`
          // html`<facet-placeholder
          //   .isCollapsed=${false}
          //   .numberOfValues=${8}
          // ></facet-placeholder>`
        )}
      `;
    }

    // TODO: improve render function
    return html`
      ${this.facetGenerator.facets.slice(0, 1).map((facet, index) => {
        if (facet.state.values.length === 0) {
          return nothing;
        }

        const props = <T>() => ({
          isCollapsed: this.shouldCollapseFacet(index),
          summary: this.summary,
          facet: facet as T,
          field: facet.state.field,
          key: facet.state.facetId,
        });

        // TODO: use choose directive instead
        switch (facet.state.type) {
          case 'regular':
            return html`
              <atomic-commerce-facet
                .isCollapsed=${props<RegularFacet>().isCollapsed}
                .summary=${props<RegularFacet>().summary}
                .facet=${props<RegularFacet>().facet}
                .field=${props<RegularFacet>().field}
              ></atomic-commerce-facet>
            `;
          // .key=${props<RegularFacet>().key} // TODO: check for hey prop
          case 'numericalRange':
            return html``;
          case 'dateRange':
            return html``;
          case 'hierarchical':
            return html``;
          default:
            this.bindings.engine.logger.warn('Unexpected facet type.');
            return nothing;
        }
      })}
    `;
  }
}
