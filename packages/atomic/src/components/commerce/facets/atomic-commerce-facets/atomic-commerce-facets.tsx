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
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {Component, h, Element, State, Prop, Fragment} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {createAppLoadedListener} from '../../../common/interface/store';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-facets` component automatically renders commerce facets based on the Commerce API response.
 * Unlike regular facets, which require explicit definition and request in the query, the `atomic-commerce-facets` component dynamically generates facets.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-facets',
  shadow: false,
})
export class AtomicCommerceFacets implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  public facetGenerator!: FacetGenerator;
  public summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
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
  public facetGeneratorState!: FacetGeneratorState;

  @State() public error!: Error;
  @State() private isAppLoaded = false;

  public initialize() {
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
    if (!this.isAppLoaded) {
      return [...Array.from({length: this.collapseFacetsAfter})].map(() => (
        <FacetPlaceholder isCollapsed={false} numberOfValues={8} />
      ));
    }
    return (
      <Fragment>
        {this.facetGenerator.facets.map((facet, index) => {
          if (facet.state.values.length === 0) {
            return;
          }

          const props = <T,>() => ({
            isCollapsed: this.shouldCollapseFacet(index),
            summary: this.summary,
            facet: facet as T,
            field: facet.state.field,
            key: facet.state.facetId,
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
              // TODO COMHUB-291 support location facet
              this.bindings.engine.logger.warn('Unexpected facet type.');
              return;
            }
          }
        })}
      </Fragment>
    );
  }
}
