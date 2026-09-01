import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticUserActionsToggle extends LightningElement {
  @api engineId = 'quantic-user-actions-toggle-engine';
  insightId = '6a333202-b1e0-451e-8664-26a1f93c2faf';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic User Actions Toggle';
  pageDescription =
    'The `QuanticUserActionsToggle` component displays a button that opens a modal containing the user actions timeline component.';
  options = [
    {
      attribute: 'userId',
      label: 'User Id',
      description:
        'The ID of the user whose actions are being displayed. For example in email format "someone@company.com".',
    },
    {
      attribute: 'ticketCreationDateTime',
      label: 'Ticket Creation Date Time',
      description:
        'The date and time when the ticket was created. For example "2024-01-01T00:00:00Z"',
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
