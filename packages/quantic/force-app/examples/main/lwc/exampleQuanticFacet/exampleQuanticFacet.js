import {api, LightningElement} from 'lwc';

export default class ExampleQuanticFacet extends LightningElement {
    @api engineId = 'quantic-facet-engine';

    field;
    label = 'Type';

    handleFieldChange(evt) {
        this.field = evt.detail.value;
    }

    handleLabelChange(evt) {
        this.label = evt.detail.value;
    }
}