import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';
import { api, LightningElement, track } from 'lwc';

export default class QuanticFacetManager extends LightningElement {
  @api engineId;
  @track state;

  facetManager;
  unsubscribe;

  host;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);

    this.host = this.template.querySelector('.facet-manager__host');
    this.moveFacetsToHost();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  initialize = (engine) => {
    this.facetManager = CoveoHeadless.buildFacetManager(engine);
    this.unsubscribe = this.facetManager.subscribe(() => this.updateState());
  }

  updateState() {
    console.log(`Facet Ids: ${this.facetManager.state.facetIds.join(', ')}`);
    this.reorderFacets();
  }

  moveFacetsToHost() {
    const facets = this.querySelectorAll('*');
    facets.forEach((facet) => {
      this.host.appendChild(facet);
    });
  }

  reorderFacets() {
    if (!this.host) {
      return;
    }

    const payload = this.facets.map((f) => ({facetId: f.field, payload: f}));
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
    return 'field' in el;
  }
}
