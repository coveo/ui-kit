import {registerComponentForInit} from 'c/quanticHeadlessLoader';
import {api, LightningElement, track} from 'lwc';
import {result} from './result';

export default class ExampleQuanticResultQuickview extends LightningElement {
  @api engineId = 'quantic-result-quickview-engine';
  @track config = {};
  isConfigured = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  pageTitle = 'Quantic Result Quickview';
  pageDescription =
    'The Quantic Result Quickview component renders a button which the end user can click to open a modal box containing certain information about a result.';
  options = [
    {
      attribute: 'result',
      label: 'Result',
      description: 'The result to retrieve a quickview for.',
      defaultValue: JSON.stringify(result),
    },
    {
      attribute: 'maximumPreviewSize',
      label: 'Maximum preview size',
      description:
        'The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.',
      defaultValue: undefined,
    },
    {
      attribute: 'previewButtonIcon',
      label: 'Preview button icon',
      description: 'The icon to be shown in the preview button.',
      defaultValue: 'utility:preview',
    },
    {
      attribute: 'previewButtonLabel',
      label: 'Preview button label',
      description: 'The label to be shown in the preview button.',
      defaultValue: undefined,
    },
    {
      attribute: 'previewButtonVariant',
      label: 'Preview button variant',
      description: 'The variant of the preview button.',
      defaultValue: undefined,
    },
    {
      attribute: 'tooltip',
      label: 'Tooltip',
      description:
        'The label displayed in the tooltip of the quick view button.',
      defaultValue: null,
    },
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];

  expectedEvents = ['quantic__haspreview', 'quantic__resultactionregister'];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.config.result = JSON.parse(evt.detail.result);
    this.isConfigured = true;
  }
}
