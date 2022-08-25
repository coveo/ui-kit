import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticRefineToggle extends LightningElement {
  @api engineId = 'quantic-refine-toggle';
  @track config = {};
  isConfigured = false;

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
      attribute: 'withoutFacets',
      label: 'Without Facets',
      description:
        'Indicates whether the facets should be added to the search interface.',
      defaultValue: false,
    },
    {
      attribute: 'facetWithoutInputs',
      label: 'Facets Without Inputs',
      description:
        'Indicates whether the facets with inputs should be used.',
      defaultValue: false,
    },
  ];

  formattingFunction = (item) => `${item.start} - ${item.end}`;

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
