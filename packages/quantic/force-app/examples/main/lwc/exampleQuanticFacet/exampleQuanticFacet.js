import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacet extends LightningElement {
    @api engineId = 'quantic-facet-engine';

    isConfigured = false;
    @track config = {};

    slotButtonClicked = false;

    handleTryItNow(evt) {
        this.config = evt.detail;
        this.isConfigured = true;
    }
}