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
  buildListingSummary,
  buildSearchSummary,
  ListingSummary,
  SearchSummary,
} from '@coveo/headless/commerce';
import {Component, h, Element, State, Prop, Fragment} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-facets` component automatically renders commerce facets based on the Commerce API response.
 * Unlike regular facets, which require explicit definition and request in the query, the `atomic-commerce-facets` component dynamically generates facets.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-facets',
  styleUrl: 'atomic-commerce-facets.pcss',
  shadow: false,
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
  public summary!: ListingSummary | SearchSummary;

  @State() public error!: Error;

  public initialize() {
    this.validateProps();
    const {engine} = this.bindings;
    this.facetGenerator = this.facetGeneratorBuilder(engine).facetGenerator();
    this.summary = this.summaryBuilder(engine);
  }

  private isProductListing() {
    return this.bindings.interfaceElement.type === 'product-listing';
  }

  private get facetGeneratorBuilder() {
    return this.isProductListing() ? buildProductListing : buildSearch;
  }

  private get summaryBuilder() {
    return this.isProductListing() ? buildListingSummary : buildSearchSummary;
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
    if (!this.summary.state.firstSearchExecuted) {
      return [...Array(this.collapseFacetsAfter)].map(() => (
        <FacetPlaceholder numberOfValues={8} isCollapsed={false} />
      ));
    }
    return (
      <Fragment>
        {this.facetGenerator.facets.map((facet, index) => {
          if (facet.state.values.length === 0) {
            console.log('yo');
            return;
          }

          const props = <T,>() => ({
            isCollapsed: this.shouldCollapseFacet(index),
            summary: this.summary,
            facet: facet as T,
          });

          switch (facet.state.type) {
            case 'regular':
              return (
                <atomic-commerce-facet
                  {...props<RegularFacet>()}
                ></atomic-commerce-facet>
              );
            case 'numericalRange':
              return (
                <atomic-commerce-numeric-facet
                  {...props<NumericFacet>()}
                ></atomic-commerce-numeric-facet>
              );
            case 'dateRange':
              return (
                <atomic-commerce-timeframe-facet
                  {...props<DateFacet>()}
                ></atomic-commerce-timeframe-facet>
              );
            case 'hierarchical':
              return (
                <atomic-commerce-category-facet
                  {...props<CategoryFacet>()}
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
      </Fragment>
    );
  }
}
