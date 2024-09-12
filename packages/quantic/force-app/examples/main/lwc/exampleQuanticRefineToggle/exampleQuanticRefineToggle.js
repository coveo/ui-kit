// @ts-nocheck
import {api, LightningElement, track} from 'lwc';
import templateWithFacets from './templateWithFacets.html';
import templateWithFacetsWithoutInputs from './templateWithFacetsWithoutInputs.html';
import templateWithoutFacets from './templateWithoutFacets.html';

export default class ExampleQuanticRefineToggle extends LightningElement {
  @api engineId = 'quantic-refine-toggle';
  @track config = {};
  isConfigured = false;

  withoutFacets = true;
  facetWithoutInputs = false;

  connectedCallback() {
    this.addEventListener('addFacets', this.handleAddFacets);
    this.addEventListener(
      'addFacetsWithoutInputs',
      this.handleAddFacetsWithoutInputs
    );
  }

  disconnectedCallback() {
    this.removeEventListener('addFacets', this.handleAddFacets);
    this.removeEventListener(
      'addFacetsWithoutInputs',
      this.handleAddFacetsWithoutInputs
    );
  }

  handleAddFacets = () => {
    this.withoutFacets = false;
  };

  handleAddFacetsWithoutInputs = () => {
    this.withoutFacets = false;
    this.facetWithoutInputs = true;
  };

  pageTitle = 'Quantic Refine Toggle';
  pageDescription =
    'The QuanticRefineToggle component displays a button that is used to open the refine modal.';
  options = [
    {
      attribute: 'hideSort',
      label: 'Hide Sort',
      description: 'Whether the Quantic Sort component should be hidden.',
      defaultValue: false,
    },
    {
      attribute: 'fullScreen',
      label: 'Full screen',
      description:
        'Indicates whether the refine modal should be opened in full screen.',
      defaultValue: false,
    },
    {
      attribute: 'title',
      label: 'Title',
      description: 'The title of the toggle button.',
      defaultValue: 'Sort & Filters',
    },
    {
      attribute: 'disableDynamicNavigation',
      label: 'Disable Dynamic Navigation',
      description:
        'Indicates whether the dynamic navigation experience should be disabled.',
      defaultValue: false,
    },
  ];

  formattingFunction = (item) => `${item.start} - ${item.end}`;

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }

  render() {
    if (this.withoutFacets) {
      return templateWithoutFacets;
    }
    if (this.facetWithoutInputs) {
      return templateWithFacetsWithoutInputs;
    }
    return templateWithFacets;
  }
}
