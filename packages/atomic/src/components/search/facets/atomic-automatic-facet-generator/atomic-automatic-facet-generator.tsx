import {NumberValue, Schema} from '@coveo/bueno';
import {
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorState,
  SearchStatus,
  SearchStatusState,
  buildAutomaticFacetGenerator,
  buildSearchStatus,
} from '@coveo/headless';
import {Component, Method, Prop, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-automatic-facet-generator` is a component that renders the facets from
 * the automatic facets feature.
 *
 * Unlike traditional facets that need to be explicitly defined and requested in the query, automatic facets are dynamically generated by the index
 * in response to the search query.
 *
 * It dynamically creates multiple `atomic-automatic-facet`
 * components based on the desiredCount prop.
 *
 * To read more about the automatic facet generator feature, see: https://docs.coveo.com/en/n9sd0159/
 */
@Component({
  tag: 'atomic-automatic-facet-generator',
  styleUrl: 'atomic-automatic-facet-generator.pcss',
  shadow: false,
})
export class AtomicAutomaticFacetGenerator implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  public automaticFacetGenerator!: AutomaticFacetGenerator;
  @BindStateToController('automaticFacetGenerator')
  @State()
  private automaticFacetGeneratorState!: AutomaticFacetGeneratorState;

  public searchStatus!: SearchStatus;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;

  /**
   * The desired count of automatic facets.
   *
   * Minimum: `1`
   * Maximum: `10`
   * @defaultValue `5`
   */
  @Prop() public desiredCount!: number;

  /**
   * The desired number of automatically generated facet values.
   *
   * Minimum: `1`
   * @defaultValue `8`
   */
  @Prop() public numberOfValues = 8;

  @State() private collapseFacetsAfter = -1;

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.automaticFacetGenerator = buildAutomaticFacetGenerator(
      this.bindings.engine,
      {
        options: {
          desiredCount: this.desiredCount,
          numberOfValues: this.numberOfValues,
        },
      }
    );
  }

  @Method()
  public async updateCollapseFacetsDependingOnFacetsVisibility(
    collapseAfter: number,
    numberOfVisibleFacets: number
  ) {
    if (collapseAfter === -1) {
      this.collapseFacetsAfter = -1;
      return;
    }
    this.collapseFacetsAfter = Math.max(
      0,
      collapseAfter - numberOfVisibleFacets
    );
  }

  private validateProps() {
    new Schema({
      collapseFacetAfter: new NumberValue({min: -1, required: false}),
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
    const automaticFacets =
      this.automaticFacetGeneratorState.automaticFacets.map((facet, index) => {
        return (
          <atomic-automatic-facet
            key={facet.state.field}
            field={facet.state.field}
            facetId={facet.state.field}
            facet={facet}
            searchStatus={this.searchStatus}
            isCollapsed={this.shouldCollapseFacet(index)}
          ></atomic-automatic-facet>
        );
      });
    if (!this.searchStatus.state.firstSearchExecuted) {
      return Array.from({length: this.desiredCount}, (_, index) => (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={this.shouldCollapseFacet(index)}
        />
      ));
    }

    return automaticFacets;
  }
}
