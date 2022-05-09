import { api, LightningElement, track } from 'lwc';

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
      description: 'Indicates whether the refine modal will be opened in full screen.',
      defaultValue: false,
    },
    {
      attribute: 'buttonLabel',
      label: 'Button Label',
      description: 'The label to be shown in the refine toggle button.',
      defaultValue: 'Sort & Filters',
    },
    {
      attribute: 'hideIcon',
      label: 'Hide icon',
      description: 'Indicates whether the icon of the refine toggle button should be hidden.',
      defaultValue: false,
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
