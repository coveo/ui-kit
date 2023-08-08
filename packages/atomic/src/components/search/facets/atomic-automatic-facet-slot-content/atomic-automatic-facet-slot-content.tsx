import {
  AutomaticFacetBuilder,
  AutomaticFacetBuilderState,
  SearchStatus,
  buildAutomaticFacetBuilder,
  buildSearchStatus,
} from '@coveo/headless';
import {Component, Host, Prop, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-automatic-facet-slot-content',
  shadow: false,
})
export class AtomicAutomaticFacetSlotContent implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  private automaticFacetBuilder!: AutomaticFacetBuilder;
  @BindStateToController('automaticFacetBuilder')
  @State()
  public automaticFacetBuilderState!: AutomaticFacetBuilderState;

  public searchStatus!: SearchStatus;

  @Prop({reflect: true}) public isThereStaticFacets!: boolean;
  @Prop({reflect: true}) public amountToCollapseNext!: number;

  public initialize() {
    const desiredCount =
      this.bindings.engine.state.automaticFacetSet?.desiredCount;
    if (desiredCount) {
      this.automaticFacetBuilder = buildAutomaticFacetBuilder(
        this.bindings.engine,
        {desiredCount}
      );
    }
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }
  public render() {
    const automaticFacets =
      this.automaticFacetBuilder?.state.automaticFacets.map((facet, index) => {
        const isCollapsed = index >= this.amountToCollapseNext;
        return (
          <atomic-automatic-facet
            key={facet.state.field}
            field={facet.state.field}
            facetId={facet.state.field}
            facet={facet}
            searchStatus={this.searchStatus}
            isCollapsed={isCollapsed}
          ></atomic-automatic-facet>
        );
      });
    return (
      <Host
        slot="automatic-facets"
        class="flex flex-col"
        style={{
          gap: 'var(--atomic-refine-modal-facet-margin, 20px)',
          marginTop: this.isThereStaticFacets
            ? 'var(--atomic-refine-modal-facet-margin, 20px)'
            : '',
        }}
      >
        {automaticFacets}
      </Host>
    );
  }
}
