import {api, LightningElement} from 'lwc';

export default class ConfiguratorQuanticFacet extends LightningElement {
    @api label;

    handleFieldChange(evt) {
        this.dispatchEvent(new CustomEvent('fieldchange', {
            detail: {
                value: evt.target.value
            }
        }));
    }

    handleLabelChange(evt) {
        this.dispatchEvent(new CustomEvent('labelchange', {
            detail: {
                value: evt.target.value
            }
        }));
    }
}