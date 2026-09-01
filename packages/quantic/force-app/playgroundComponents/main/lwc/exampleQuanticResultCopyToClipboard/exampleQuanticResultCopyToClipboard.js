import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticResultCopyToClipboard extends LightningElement {
  @api engineId = 'quantic-result-copy-to-clipboard-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Result Copy To Clipboard';
  pageDescription =
    'The QuanticResultCopyToClipboard component allows the end user to copy a result to clipboard.';
  options = [
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label to be displayed in the tooltip of the button.',
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
      attribute: 'textTemplate',
      label: 'Text Template',
      description:
        'The template used to generate the text to copy to clipboard.',
      defaultValue: '${title}\n${clickUri}',
    },
  ];

  testResult = {
    clickUri: 'https://test.com',
    excerpt: 'Test excerpt',
    title: 'Test result',
    uniqueId: 'Test unique id',
    uri: 'https://test.com',
    raw: {
      urihash: 'Test uri hash',
      permanentid: 'Test permanent id',
      objecttype: 'Test',
      source: 'Test source',
      date: 1669504751000,
    },
  };

  resultTemplateManager = {
    selectTemplate: () => null,
  };

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
