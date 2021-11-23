import { api, LightningElement, track } from 'lwc';

export default class ExampleQuanticFacetManager extends LightningElement {
  @api engineId = 'quantic-breadcrumb-manager-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Breadcrumb Manager';
  pageDescription = 'The QuanticBreadcrumbManager component creates breadcrumbs that display a summary of the currently active facet values.';
  
  options = [
      {
        attribute: 'categoryDivider',
        label: 'Category Divider',
        description: 'A character that divides each path segment in a category facet breadcrumb.',
        defaultValue: '/'
      },
      {
        attribute: 'collapseThreshold',
        label: 'Collapse Threshold',
        description: 'Maximum number of displayed breadcrumb values. When more values are selected, additional values appear under the "More" button.',
        defaultValue: 5
      },
  ]; 

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
