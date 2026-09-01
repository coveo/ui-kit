import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticRefineModalContent extends LightningElement {
  @api engineId = 'quantic-refine-modal-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Refine Modal Content';
  pageDescription =
    'The QuanticRefineModalContent component displays a copy of the search interface facets and sort components. This component is intended to be displayed inside a modal to assure the responsiveness when the search interface is displayed on smaller screens.';
  options = [
    {
      attribute: 'hideSort',
      label: 'Hide Sort',
      description: 'Whether the Quantic Sort component should be hidden.',
      defaultValue: false,
    },
    {
      attribute: 'disableDynamicNavigation',
      label: 'Disable Dynamic Navigation',
      description:
        'Indicates whether the dynamic navigation experience should be disabled.',
      defaultValue: false,
    },
  ];

  sortOptions = [
    {
      label: 'Date ascending',
      value: 'date ascending',
      criterion: {
        by: 'date',
        order: 'ascending',
      },
    },
    {
      label: 'Views Descending',
      value: '@ytviewcount descending',
      criterion: {
        by: 'field',
        field: 'ytviewcount',
        order: 'descending',
      },
    },
    {
      label: 'NO SORT',
      value: 'nosort',
      criterion: {
        by: 'nosort',
      },
    },
  ];

  formattingFunction = (item) => `${item.start} - ${item.end}`;

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
