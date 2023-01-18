import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticUserActionToggle extends LightningElement {
  @api engineId = 'quantic-user-action-toggle';
  @api insightId = '6a333202-b1e0-451e-8664-26a1f93c2faf';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic User Action Toggle';
  pageDescription =
    'The Quantic User Action Toggle component displays a button that is used to open the user action modal.';
  options = [
    {
      attribute: 'ticketCreationDate',
      label: 'Ticket creation date',
      description:
        'The date and time that corresponds to the case ticket creation.',
      defaultValue: '2023-01-04T21:00:42.741Z',
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
