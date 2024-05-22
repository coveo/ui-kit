import {NumberValue, Schema} from '@coveo/bueno';
import {
  RegularFacet,
  CategoryFacet,
  DateFacet,
  NumericFacet,
  FacetGeneratorState,
  buildProductListing,
  buildSearch,
  FacetGenerator,
} from '@coveo/headless/commerce';
import {Component, h, Element, Host, State, Prop} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-facets` component automatically renders commerce facets based on the Commerce API response.
 * Unlike regular facets, which require explicit definition and request in the query, the `atomic-commerce-facets` component dynamically generates facets.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-facets',
  styleUrl: 'atomic-commerce-facets.pcss',
  shadow: true,
})
export class AtomicCommerceFacets implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  public facetGenerator!: FacetGenerator;
  @Element() host!: HTMLElement;

  /**
   * The maximum number of facets to expand.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   * Using the value `-1` disables the feature and keeps all facets expanded.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 4;

  @BindStateToController('facetGenerator')
  @State()
  public facetGeneratorState!: FacetGeneratorState[];

  @State() public error!: Error;

  public initialize() {
    this.validateProps();
    const controller =
      this.bindings.interfaceElement.type === 'product-listing'
        ? buildProductListing
        : buildSearch;
    this.facetGenerator = controller(this.bindings.engine).facetGenerator();
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

  public render() {
    return (
      <Host>
        {this.facetGenerator.facets.map((facet, index) => {
          if (facet.state.values.length === 0) {
            return;
          }
          const props = {isCollapsed: this.shouldCollapseFacet(index)};

          switch (facet.state.type) {
            case 'regular':
              return (
                <atomic-commerce-facet
                  {...props}
                  facet={facet as RegularFacet}
                ></atomic-commerce-facet>
              );
            case 'numericalRange':
              return (
                <atomic-commerce-numeric-facet
                  {...props}
                  facet={facet as NumericFacet}
                ></atomic-commerce-numeric-facet>
              );
            case 'dateRange':
              return (
                <atomic-commerce-timeframe-facet
                  {...props}
                  facet={facet as DateFacet}
                ></atomic-commerce-timeframe-facet>
              );
            case 'hierarchical':
              return (
                <atomic-commerce-category-facet
                  {...props}
                  facet={facet as CategoryFacet}
                ></atomic-commerce-category-facet>
              );
            default: {
              this.bindings.engine.logger.warn(
                `Unexpected facet type ${facet.state.type}.`
              );
              return;
            }
          }
        })}
      </Host>
    );
  }
}
