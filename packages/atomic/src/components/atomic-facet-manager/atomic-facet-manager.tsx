import {Component, h, Element, State, Prop} from '@stencil/core';
import {
  FacetManager,
  buildFacetManager,
  FacetManagerState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

interface FacetElement extends HTMLElement {
  facetId: string;
}

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
   * The number of expanded facets inside the manager.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   * Using the value `-1` disables the feature and keeps all facets expanded.
   */
  @Prop() public collapseFacetsAfter = 4;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);

    // An update has to be forced for the facets to be visually updated, without being interacted with.
    this.bindings.i18n.on('languageChanged', this.sortFacets);
  }

  private sortFacets = () => {
    if (!this.searchStatusState.firstSearchExecuted) {
      return;
    }
    const payload = this.facets.map((f) => ({facetId: f.facetId, payload: f}));
    const sortedFacets = this.facetManager.sort(payload).map((f) => f.payload);
    this.updateCollapsedState(sortedFacets);

    this.host.append(...sortedFacets);
  };

  private updateCollapsedState(facets: FacetElement[]) {
    if (this.collapseFacetsAfter === -1) {
      return;
    }

    facets.forEach((facet, index) => {
      facet.setAttribute(
        'is-collapsed',
        index + 1 > this.collapseFacetsAfter ? 'true' : 'false'
      );
    });
  }

  private get facets() {
    const facets: FacetElement[] = [];
    const children = Array.from(this.host.children);

    children.forEach((child) => {
      this.isPseudoFacet(child) && facets.push(child);
    });

    return facets;
  }

  private isPseudoFacet(el: Element): el is FacetElement {
    return 'facetId' in el;
  }

  disconnectedCallback() {
    this.bindings.i18n.off('languageChanged', this.sortFacets);
  }

  public render() {
    return <slot />;
  }
}
