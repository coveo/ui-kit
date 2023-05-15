import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticSmartSnippet extends LightningElement {
  @api engineId = 'quantic-smart-snippet';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Smart Snippet';
  pageDescription =
    'The Quantic Smart Snippet displays the excerpt of a document that would be most likely to answer a particular query.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
    {
      attribute: 'maximumSnippetHeight',
      label: 'Maximum snippet height',
      description:
        'The maximum height an answer can have in pixels. Any part of an answer exceeding this height will be hidden by default and expendable via a "show more" button.',
      defaultValue: 250,
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
