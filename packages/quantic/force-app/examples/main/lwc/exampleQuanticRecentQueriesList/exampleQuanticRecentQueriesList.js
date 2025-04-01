import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticRecentQueriesList extends LightningElement {
  @api engineId = 'quantic-recent-queries-list-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Recent Queries List';
  pageDescription =
    "The Quantic Recent Queries List component displays the user's recent queries.";
  options = [
    {
      attribute: 'maxLength',
      label: 'Max length',
      description: 'The maximum number of queries to keep in the list.',
      defaultValue: 10,
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'This label is displayed in the component header.',
      defaultValue: 'Recent Queries',
    },
    {
      attribute: 'isCollapsed',
      label: 'Is collapsed',
      description: 'Whether the component is collapsed.',
      defaultValue: false,
    },
    {
      attribute: 'hideWhenEmpty',
      label: 'Hide when empty',
      description:
        'Indicates whether the card of the recent queries list should be completely hidden when it is empty.',
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
