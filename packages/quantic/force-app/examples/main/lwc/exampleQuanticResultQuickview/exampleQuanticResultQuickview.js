import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticResultQuickview extends LightningElement {
    @api engineId = 'quantic-result-quickview-engine';
    @track config = {};
    isConfigured = false;

    pageTitle = 'Quantic Result Quickview';
    pageDescription = 'The Quantic Result Quickview component renders a button which the end user can click to open a modal box containing certain information about a result.'
    options = [
        {
            attribute: 'result',
            label: 'Result',
            description: 'The result to retrieve a quickview for.',
            defaultValue: null
        },
        {
            attribute: 'maximumPreviewSize',
            label: 'Maximum preview size',
            description: 'The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.',
            defaultValue: undefined
        },
        {
            attribute: 'previewButtonIcon',
            label: 'Preview button icon',
            description: 'The icon to be shown in the preview button.',
            defaultValue: 'utility:preview'
        },
        {
            attribute: 'previewButtonLabel',
            label: 'Preview button label',
            description: 'The label to be shown in the preview button.',
            defaultValue: undefined
        },
        {
            attribute: 'previewButtonVariant',
            label: 'Preview button variant',
            description: 'The variant of the preview button.',
            defaultValue: undefined
        },
    ]

    handleTryItNow(evt) {
        this.config = evt.detail;
        this.isConfigured = true;
    }
}