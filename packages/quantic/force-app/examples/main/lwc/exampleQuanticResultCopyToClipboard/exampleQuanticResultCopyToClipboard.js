import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import defaultTemplate from './resultTemplate.html';

export default class ExampleQuanticResultCopyToClipboard extends LightningElement {
  @api engineId = 'quantic-result-copy-to-clipboard-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Result Copy To Clip Board';
  pageDescription = 'The QuanticResultCopyToClipboard component is responsible for displaying query results by applying one or more result templates.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
    {
      attribute: 'label',
      label: 'Label',
      description:
        'The label to be displayed in the tooltip of the button.',
      defaultValue: 'Copy',
    },
    {
      attribute: 'successLabel',
      label: 'Success Label',
      description:
        'The label to be displayed in the tooltip of the button when the action is successful.',
      defaultValue: 'Copied!',
    },
    {
      attribute: 'template',
      label: 'Template',
      description:
        'The template that will be used for the copy to clipboard.',
      defaultValue: '${title}\n${clickUri}',
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }

  handleResultTemplateRegistration(event) {
    event.stopPropagation();

    const resultTemplatesManager = event.detail;
    resultTemplatesManager.registerTemplates(
      {
        content: defaultTemplate,
        conditions: [],
      }
    );
  }
}