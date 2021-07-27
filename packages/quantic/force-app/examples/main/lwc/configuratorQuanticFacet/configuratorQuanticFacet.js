import {LightningElement} from 'lwc';

export default class ConfiguratorQuanticFacet extends LightningElement {
    field = 'objecttype';
    label = 'Type';
    configured = false;

    handleFieldChange(evt) {
        this.field = evt.target.value;
    }

    handleLabelChange(evt) {
        this.label = evt.target.value;
    }

    handleTryItNow(evt) {
        this.configured = true;
        this.dispatchEvent(new CustomEvent('tryitnow', {
            detail: {
                field: this.field,
                label: this.label
            }
        }));
    }

    handleReset(evt) {
        window.location.reload();
    }
}