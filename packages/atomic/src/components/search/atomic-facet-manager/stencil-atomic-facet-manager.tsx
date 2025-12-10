import {NumberValue, Schema} from '@coveo/bueno';
import {
  FacetManager,
  buildFacetManager,
  FacetManagerState,
} from '@coveo/headless';
import {Component, h, Element, State, Prop} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  getFacetsInChildren,
  getAutomaticFacetGenerator,
  sortFacetVisibility,
  collapseFacetsAfter,
  BaseFacetElement,
} from '../../common/facets/stencil-facet-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-facet-manager` is a component that manages facets by performing three key functions:
 *
 * 1. **Sorting facets** - Reorders facets based on the search response to show the most relevant facets first.
 * 1. **Managing visibility** - Controls which facets should be visible or hidden based on available values and dependencies.
 * 1. **Managing collapse state** - Automatically expands or collapses facets based on the `collapse-facets-after` property.
 *
 * @slot default - Facet components are slotted within to leverage this functionality.
 *
 */
@Component({
  tag: 'atomic-facet-manager',
  shadow: false,
})
export class AtomicFacetManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facetManager!: FacetManager;

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
   * Using the value `-1` disables the feature and keeps all facets expanded. Useful when you want to set the collapse state for each facet individually.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 4;

  public initialize() {
    this.validateProps();
    this.facetManager = buildFacetManager(this.bindings.engine);

    // An update has to be forced for the facets to be visually updated, without being interacted with.
    this.bindings.i18n.on('languageChanged', this.sortFacets);
  }

  private sortFacets = () => {
    const facets = getFacetsInChildren(this.host);

    const sortedFacets = this.sortFacetsUsingManager(facets, this.facetManager);

    const {visibleFacets, invisibleFacets} = sortFacetVisibility(
      sortedFacets,
      this.bindings.store.getAllFacets()
    );

    const generator = getAutomaticFacetGenerator(this.host);

    collapseFacetsAfter(visibleFacets, this.collapseFacetsAfter);

    generator?.updateCollapseFacetsDependingOnFacetsVisibility(
      this.collapseFacetsAfter,
      visibleFacets.length
    );

    this.host.append(
      ...[
        ...visibleFacets,
        ...invisibleFacets,
        ...(generator ? [generator] : []),
      ]
    );
  };

  private validateProps() {
    new Schema({
      collapseFacetAfter: new NumberValue({min: -1, required: true}),
    }).validate({
      collapseFacetAfter: this.collapseFacetsAfter,
    });
  }

  private sortFacetsUsingManager(
    facets: BaseFacetElement[],
    facetManager: FacetManager
  ): BaseFacetElement[] {
    const payload = facets.map((f) => ({
      facetId: f.facetId,
      payload: f,
    }));
    return facetManager.sort(payload).map((f) => f.payload);
  }

  disconnectedCallback() {
    this.bindings?.i18n.off('languageChanged', this.sortFacets);
  }

  public render() {
    return <slot />;
  }
}
