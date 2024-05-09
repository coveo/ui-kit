import {
  RegularFacet,
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
        <h2>Facets {this.facetGenerator.facets.length}</h2>
        {this.facetGenerator.facets.map((facet) => {
          if (facet.state.values.length === 0) {
            return;
          }
          switch (facet.state.type) {
            case 'regular':
              return (
                <atomic-commerce-facet
                  field={facet.state.field}
                  facet={facet as RegularFacet}
                ></atomic-commerce-facet>
              );
            case 'numericalRange':
              return <div>TODO: numericalRange</div>;
            case 'dateRange':
              return <div>TODO: dateRange</div>;
            case 'hierarchical':
              return <div>TODO: hierarchical</div>;
            default:
              return <div>TODO: default</div>;
          }
        })}
      </Host>
    );
  }
}
