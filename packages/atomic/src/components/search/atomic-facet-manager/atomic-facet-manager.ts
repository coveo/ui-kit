import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildFacetManager,
  type FacetManager,
  type FacetManagerState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  type BaseFacetElement,
  collapseFacetsAfter,
  getAutomaticFacetGenerator,
  getFacetsInChildren,
  sortFacetVisibility,
} from '@/src/components/common/facets/facet-common';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-facet-manager` is a component that manages facets by performing three key functions:
 *
 * 1. **Sorting facets** - Reorders facets based on the search response to show the most relevant facets first.
 * 2. **Managing visibility** - Controls which facets should be visible or hidden based on available values and dependencies.
 * 3. **Managing collapse state** - Automatically expands or collapses facets based on the `collapse-facets-after` property.
 *
 * @slot default - Facet components are slotted within to leverage this functionality.
 */
@customElement('atomic-facet-manager')
@bindings()
export class AtomicFacetManager
  extends ChildrenUpdateCompleteMixin(LightDomMixin(LitElement))
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;

  public facetManager!: FacetManager;

  @bindStateToController('facetManager', {onUpdateCallbackMethod: 'sortFacets'})
  @state()
  public facetManagerState!: FacetManagerState;

  @state() public error!: Error;

  /**
   * The number of expanded facets inside the manager.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   * Using the value `-1` disables the feature and keeps all facets expanded. Useful when you want to set the collapse state for each facet individually.
   */
  @property({type: Number, reflect: true, attribute: 'collapse-facets-after'})
  public collapseFacetsAfter = 4;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({collapseFacetsAfter: this.collapseFacetsAfter}),
      new Schema({
        collapseFacetsAfter: new NumberValue({min: -1, required: true}),
      })
    );
  }

  public initialize() {
    this.facetManager = buildFacetManager(this.bindings.engine);

    // An update has to be forced for the facets to be visually updated, without being interacted with.
    this.bindings.i18n.on('languageChanged', this.sortFacets);
  }
  public async connectedCallback() {
    super.connectedCallback();
    console.log('connectedCallback called in atomic-facet-manager');
    await this.getUpdateComplete();
  }

  private sortFacets = async () => {
    await this.getUpdateComplete();

    const facets = getFacetsInChildren(this);

    const sortedFacets = this.sortFacetsUsingManager(facets, this.facetManager);

    const {visibleFacets, invisibleFacets} = sortFacetVisibility(
      sortedFacets,
      this.bindings.store.getAllFacets()
    );

    const generator = getAutomaticFacetGenerator(this);

    collapseFacetsAfter(visibleFacets, this.collapseFacetsAfter);

    generator?.updateCollapseFacetsDependingOnFacetsVisibility(
      this.collapseFacetsAfter,
      visibleFacets.length
    );

    this.append(
      ...[
        ...visibleFacets,
        ...invisibleFacets,
        ...(generator ? [generator] : []),
      ]
    );
  };

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
    super.disconnectedCallback();
    this.bindings?.i18n.off('languageChanged', this.sortFacets);
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    return html`<slot></slot>`;
  }
}
