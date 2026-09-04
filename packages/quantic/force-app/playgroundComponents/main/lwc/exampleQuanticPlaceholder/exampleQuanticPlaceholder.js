import {LightningElement, track} from 'lwc';

export default class ExampleQuanticPlaceholder extends LightningElement {
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Placeholder';
  pageDescription =
    'The Quantic Placeholder component is used internally to display a loading placeholder for certain components.';
  options = [
    {
      attribute: 'variant',
      label: 'Variant',
      description: 'The type of placeholder to display.',
    },
    {
      attribute: 'numberOfRows',
      label: 'Number of rows',
      description: 'Number of rows to display inside the placeholder',
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
