import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';
import { api, LightningElement, track } from 'lwc';

/** @typedef {import("coveo").FacetManager} FacetManager */
/** @typedef {import("coveo").FacetManagerState} FacetManagerState */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchStatusState} SearchStatusState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */


/**
 * The `QuanticFacetManager` component acts as a container component allowing facets to be reordered dynamically as search queries are performed.
 * 
 * An item template element can be assigned to the `itemTemplate` slot allowing to customize the element that wraps each facet.
 * 
 * @example
 * <c-quantic-facet-manager engine-id={engineId}>
 *   <c-quantic-facet engine-id={engineId} field="type"></c-quantic-facet>
 *   <c-quantic-facet engine-id={engineId} field="author"></c-quantic-facet>
 * 
 *   <div slot="itemTemplate" class="slds-var-m-bottom_large"></div>
 * </c-quantic-facet-manager>
 */
export default class QuanticFacetManager extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   */
  @api engineId;

  /** @type {FacetManagerState} */
  @track facetManagerState;
  /** @type {SearchStatusState} */
  @track searchStatusState;

  /** @type {FacetManager} */
  facetManager;
  /** @type {Function} */
  unsubscribeFacetManager;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {Function} */
  unsubscribeSearchStatus;

  host;
  itemTemplate;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);

    this.host = this.template.querySelector('.facet-manager__host');
    this.resolveItemTemplate();
    this.moveFacetsToHost();
  }

  disconnectedCallback() {
    this.unsubscribeFacetManager?.();
    this.unsubscribeSearchStatus?.();
  }

  /**
   * @param {SearchEngine} engine 
   */
  initialize = (engine) => {
    this.facetManager = CoveoHeadless.buildFacetManager(engine);
    this.unsubscribeFacetManager = this.facetManager.subscribe(() => this.updateFacetManagerState());
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateSearchStatusState());
  }

  updateFacetManagerState() {
    this.reorderFacets();
  }

  updateSearchStatusState() {
    this.searchStatusState = this.searchStatus.state;
  }

  moveFacetsToHost() {
    const facets = this.querySelectorAll('*');
    facets.forEach((facet) => {
      const wrapper = this.itemTemplate.cloneNode(false);
      // @ts-ignore
      wrapper.setAttribute('data-facet-id', facet.facetId ?? facet.field);
      
      wrapper.appendChild(facet);
      this.host.appendChild(wrapper);
    });
  }

  resolveItemTemplate() {
    this.itemTemplate = document.createElement('div');
    this.itemTemplate.className = 'slds-var-m-bottom_large';

    const slotElement = this.querySelector('*[slot="itemTemplate"]');
    if (slotElement) {
      this.itemTemplate = slotElement.cloneNode(false);
      this.itemTemplate.removeAttribute('slot');
      
      slotElement.remove();
    }
  }

  reorderFacets() {
    if (!this.searchStatusState?.firstSearchExecuted) {
      return;
    }

    const payload = this.facets.map((f) => ({facetId: f.dataset.facetId, payload: f}));
    const sortedFacets = this.facetManager.sort(payload).map((f) => f.payload);

    sortedFacets.forEach((sortedFacet) => {
      this.host.appendChild(sortedFacet);
    });
  }

  get facets() {
    const facets = [];
    const children = Array.from(this.host.children);

    children.forEach((child) => {
      if (this.isPseudoFacet(child)) {
        facets.push(child);
      }
    });

    return facets;
  }

  isPseudoFacet(el) {
    return 'facetId' in el.dataset;
  }
}
