import {api, LightningElement} from 'lwc';

export default class QuanticFacetCaption extends LightningElement {
    /**
     * @type {string}
     */
    @api value;

    /**
     * @type {string}
     */
    @api caption;

    @api
    get captions() {
        return {
            [this.value]:  this.caption
        };
    }
}