import { LightningElement, api, track } from 'lwc';

export default class QuanticResult extends LightningElement {
    @api engineId;
    @api result;
    @api resultTemplatesManager;
    @api foldedResultListManager;
    @api foldedCollection;
    @api templateId;
    @api openPreviewId;

    @track resultHasPreview = true;
}