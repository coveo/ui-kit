import {
  RegularFacet,
  CategoryFacet,
  DateFacet,
  NumericFacet,
  buildProductListingFacetGenerator,
  buildSearchFacetGenerator,
  ProductListingFacetGenerator,
  SearchFacetGenerator,
  FacetGeneratorState,
} from '@coveo/headless/commerce';
import {Component, h, Element, Host, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-facets` component automatically renders commerce facets based on the search query response.
 * Unlike regular facets, which require explicit definition and request in the query, the `atomic-commerce-facets` component dynamically generates facets.
 *
 * TODO: add more info and URL links
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
  public facetGenerator!: ProductListingFacetGenerator | SearchFacetGenerator;
  @Element() host!: HTMLElement;

  @BindStateToController('facetGenerator')
  @State()
  public facetGeneratorState!: FacetGeneratorState[];
  @State() public error!: Error;

  public initialize() {
    this.facetGenerator =
      this.bindings.interfaceElement.type === 'product-listing'
        ? buildProductListingFacetGenerator(this.bindings.engine)
        : buildSearchFacetGenerator(this.bindings.engine);
  }

  public render() {
    return (
      <Host>
        {this.facetGenerator.facets.map((facet) => {
          if (facet.state.values.length === 0) {
            return;
          }
          switch (facet.state.type) {
            case 'regular':
              return (
                <atomic-commerce-facet
                  facet={facet as RegularFacet}
                ></atomic-commerce-facet>
              );
            case 'numericalRange':
              return (
                <atomic-commerce-numeric-facet
                  facet={facet as NumericFacet}
                ></atomic-commerce-numeric-facet>
              );
            case 'dateRange':
              return (
                <atomic-commerce-timeframe-facet
                  facet={facet as DateFacet}
                ></atomic-commerce-timeframe-facet>
              );
            case 'hierarchical':
              return (
                <atomic-commerce-category-facet
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
