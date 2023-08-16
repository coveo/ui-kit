import {NumberValue, Schema} from '@coveo/bueno';
import {
  FacetManager,
  buildFacetManager,
  FacetManagerState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, Element, State, Prop} from '@stencil/core';
import {isTagNameAutomaticFacetGenerator} from '../../../utils/automatic-facet-generator-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  AutomaticFacetGeneratorElement,
  BaseFacetElement,
  FacetManagerElements,
  facetShouldBeInitiallyCollapsed,
} from '../../common/facets/facet-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

interface VisibilitySortedFacets {
  visibleFacets: BaseFacetElement[];
  invisibleFacets: BaseFacetElement[];
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
   * Using the value `-1` disables the feature and keeps all facets expanded. Useful when you want to set the collapse state for each facet individually.
   */
  @Prop({reflect: true}) public collapseFacetsAfter = 4;

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);

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

    const {visibleFacets, invisibleFacets} =
      this.sortFacetVisibility(sortedFacets);

    const finalElements: FacetManagerElements = [];

    const generator: AutomaticFacetGeneratorElement =
      this.automaticFacetGenerator;

    this.updateCollapsedState(visibleFacets);
    this.updateCollapseFacetsAfter(generator, visibleFacets.length);

    finalElements.push(...visibleFacets);
    finalElements.push(generator);
    finalElements.push(...invisibleFacets);

    this.host.append(...finalElements);
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

  private sortFacetVisibility(
    sortedFacets: BaseFacetElement[]
  ): VisibilitySortedFacets {
    const visibleFacets: BaseFacetElement[] = [];
    const invisibleFacets: BaseFacetElement[] = [];
    const facetsStore = this.bindings.store.getAllFacets();

    sortedFacets.forEach((facet) => {
      if (facetsStore[facet.facetId] && facetsStore[facet.facetId].isHidden()) {
        invisibleFacets.push(facet);
      } else {
        visibleFacets.push(facet);
      }
    });

    return {visibleFacets, invisibleFacets};
  }

  private updateCollapseFacetsAfter(
    generator: AutomaticFacetGeneratorElement,
    index: number
  ) {
    generator.collapseFacetsAfter = this.collapseFacetsAfter - index;
  }

  private validateProps() {
    new Schema({
      collapseFacetAfter: new NumberValue({min: -1, required: true}),
    }).validate({
      collapseFacetAfter: this.collapseFacetsAfter,
    });
  }

  private get facets(): BaseFacetElement[] {
    const children = Array.from(this.host.children);

    const facets = children.filter((child) =>
      this.isPseudoFacet(child)
    ) as BaseFacetElement[];

    return facets;
  }

  private get automaticFacetGenerator(): AutomaticFacetGeneratorElement {
    const children = Array.from(this.host.children);

    const automaticFacetGenerator = children.find((child) =>
      isTagNameAutomaticFacetGenerator(child.tagName)
    ) as AutomaticFacetGeneratorElement;

    return automaticFacetGenerator;
  }

  private isPseudoFacet(el: Element): el is BaseFacetElement {
    return 'facetId' in el;
  }

  disconnectedCallback() {
    this.bindings.i18n.off('languageChanged', this.sortFacets);
  }

  public render() {
    return <slot />;
  }
}
