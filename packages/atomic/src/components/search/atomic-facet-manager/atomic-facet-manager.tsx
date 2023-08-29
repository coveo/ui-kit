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
  FacetManagerElements,
  getFacetsInChildren,
  getGeneratorInChildren,
  sortFacetVisibility,
  sortFacetsViaManager,
  updateCollapseFacetsAfter,
  collapseFacetsAfter,
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
    const facets = getFacetsInChildren(this.host.children);

    const sortedFacets = sortFacetsViaManager(facets, this.facetManager);

    const {visibleFacets, invisibleFacets} = sortFacetVisibility(
      sortedFacets,
      this.bindings.store.getAllFacets()
    );

    const generator = getGeneratorInChildren(this.host.children);

    collapseFacetsAfter(visibleFacets, this.collapseFacetsAfter);

    updateCollapseFacetsAfter(
      generator,
      visibleFacets.length,
      this.collapseFacetsAfter
    );

    const finalElements: FacetManagerElements = [];
    finalElements.push(...visibleFacets);
    finalElements.push(...invisibleFacets);
    finalElements.push(generator);

    this.host.append(...finalElements);
  };

  private validateProps() {
    new Schema({
      collapseFacetAfter: new NumberValue({min: -1, required: true}),
    }).validate({
      collapseFacetAfter: this.collapseFacetsAfter,
    });
  }

  disconnectedCallback() {
    this.bindings.i18n.off('languageChanged', this.sortFacets);
  }

  public render() {
    return <slot />;
  }
}
