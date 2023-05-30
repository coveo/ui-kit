import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticRecentResultsList extends LightningElement {
  @api engineId = 'quantic-recent-results-list-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Recent Results List';
  pageDescription =
    "The Quantic Recent Results List component displays the current user's recently clicked results.";
  options = [
    {
      attribute: 'maxLength',
      label: 'Max length',
      description: 'The maximum number of results to keep in the list.',
      defaultValue: 10,
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'This label is displayed in the component header.',
      defaultValue: 'Recent Results',
    },
    {
      attribute: 'isCollapsed',
      label: 'Is collapsed',
      description: 'Whether the component is collapsed.',
      defaultValue: false,
    },
    {
      attribute: 'target',
      label: 'Target',
      description:
        'Where to display the linked URLs, as the name for a browsing context.',
      defaultValue: '_self',
    },
    {
      attribute: 'hideWhenEmpty',
      label: 'Hide when empty',
      description:
        'Indicates whether the card of the recent results list should be completely hidden when it is empty.',
      defaultValue: false,
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
