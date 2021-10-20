import { api, LightningElement, track } from 'lwc';

export default class ExampleQuanticFacetManager extends LightningElement {
  @api engineId = 'quantic-facet-manager-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Facet Manager';
  pageDescription = 'The QuanticFacetManager component acts as a container allowing facets to be reordered dynamically as search queries are performed.';
  options = [];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
