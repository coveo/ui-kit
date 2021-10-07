import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';
import { api, LightningElement, track } from 'lwc';

export default class QuanticFacetManager extends LightningElement {
  @api engineId;
  @track facetManagerState;
  @track searchStatusState;

  facetManager;
  unsubscribeFacetManager;
  searchStatus;
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
