import { api, LightningElement, track } from 'lwc';

export default class ExampleQuanticRefineModalContent extends LightningElement {
  @api engineId = 'quantic-refine-modal-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Refine Modal Content';
  pageDescription =
    'The QuanticRefineModalContent` component duplicates and displays the facets present in the search interface in addition to the sort component. This components is primarly made to be displayed inside a modal to assure the responsivness when the search interface is displayed in smaller screens.';
  options = [
    {
      attribute: 'hideSort',
      label: 'Hide Sort',
      description: 'Whether the Quantic Sort component should be hidden.',
      defaultValue: false,
    },
  ];

  formattingFunction = (item) => `${item.start} - ${item.end}`;

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
