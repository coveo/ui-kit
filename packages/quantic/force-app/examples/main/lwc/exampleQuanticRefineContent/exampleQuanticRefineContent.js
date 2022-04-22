import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticRefineContent extends LightningElement {
    @api engineId = 'quantic-facet-engine';
    @track config = {};
    isConfigured = false;

    pageTitle = 'Quantic Refine Content';
    pageDescription = 'The Quantic Facet allows users to refine search results by selecting one or more field values.'
    options = [
        {
            attribute: 'showSort',
            label: 'Show Sort',
            description: 'The name of the field to display as a facet.',
            defaultValue: false
        },
    ]

    handleTryItNow(evt) {
        this.config = evt.detail;
        this.isConfigured = true;
    }
}