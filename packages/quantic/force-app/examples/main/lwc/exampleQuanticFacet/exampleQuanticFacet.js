import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacet extends LightningElement {
    @api engineId = 'quantic-facet-engine';
    @track config = {};
    isConfigured = false;
    options = [
        {
            attribute: 'field',
            label: 'Field',
            description: 'The name of the field to display as a facet.',
            defaultValue: 'objecttype'
        },
        {
            attribute: 'label',
            label: 'Label',
            description: 'The label to use as the facet title.',
            defaultValue: 'Type'
        }
    ]

    handleTryItNow(evt) {
        this.config = evt.detail;
        this.isConfigured = true;
    }
}