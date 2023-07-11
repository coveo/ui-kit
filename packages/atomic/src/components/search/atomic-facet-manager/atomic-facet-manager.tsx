import {NumberValue, Schema} from '@coveo/bueno';
import {
  FacetManager,
  buildFacetManager,
  FacetManagerState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, Element, State, Prop, Host} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  BaseFacetElement,
  facetShouldBeInitiallyCollapsed,
} from '../../common/facets/facet-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-facet-manager` helps reorder facets and their values to match the most recent search response with the most relevant results. A facet component is slotted within an `atomic-facet-manager` to leverage this functionality.
 */
@Component({
  tag: 'atomic-facet-manager',
  shadow: false,
})
export class AtomicFacetManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facetManager!: FacetManager;
  public searchStatus!: SearchStatus;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  @Element() private host!: HTMLDivElement;

  @BindStateToController('facetManager', {
    onUpdateCallbackMethod: 'sortFacets',
  })
  @State()
  public facetManagerState!: FacetManagerState;
  @State() public error!: Error;
  /**
   * @beta - This prop is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired count of automatic facets.
   * Must be a positive integer.
   */
  @Prop() public desiredCount?: number;
  /**
   * The number of expanded facets inside the manager.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   * Using the value `-1` disables the feature and keeps all facets expanded. Useful when you want to set the collapse state for each facet individually.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 4;

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.facetManager = this.desiredCount
      ? buildFacetManager(this.bindings.engine, {
          desiredCount: this.desiredCount,
        })
      : buildFacetManager(this.bindings.engine);

    // An update has to be forced for the facets to be visually updated, without being interacted with.
    this.bindings.i18n.on('languageChanged', this.sortFacets);
  }

  private sortFacets = () => {
    if (!this.searchStatusState.firstSearchExecuted) {
      this.updateCollapsedState(this.facets);
      return;
    }
    const payload = this.facets.map((f) => ({facetId: f.facetId, payload: f}));
    const sortedFacets = this.facetManager.sort(payload).map((f) => f.payload);
    this.updateCollapsedState(sortedFacets);
    this.host.append(...sortedFacets);
  };

  private updateCollapsedState(facets: BaseFacetElement[]) {
    if (this.collapseFacetsAfter === -1) {
      return;
    }

    facets.forEach((facet, index) => {
      facet.isCollapsed = facetShouldBeInitiallyCollapsed(
        index,
        this.collapseFacetsAfter
      );
    });
  }

  private validateProps() {
    new Schema({
      collapseFacetAfter: new NumberValue({min: -1, required: true}),
    }).validate({
      collapseFacetAfter: this.collapseFacetsAfter,
    });
  }

  private get facets() {
    const facets: BaseFacetElement[] = [];
    const children = Array.from(this.host.children);

    children.forEach((child) => {
      this.isPseudoFacet(child) && facets.push(child);
    });

    return facets;
  }

  private isPseudoFacet(el: Element): el is BaseFacetElement {
    return 'facetId' in el;
  }

  disconnectedCallback() {
    this.bindings.i18n.off('languageChanged', this.sortFacets);
  }

  public render() {
    const automaticFacets = this.facetManagerState.automaticFacets?.map(
      (facet) => {
        return (
          <atomic-automatic-facet
            key={facet.state.field}
            field={facet.state.field}
            facetId={facet.state.field}
            facet={facet}
            searchStatus={this.searchStatus}
          ></atomic-automatic-facet>
        );
      }
    );
    return (
      <Host>
        <slot />
        {automaticFacets}
      </Host>
    );
  }
}
