import { LightningElement, api } from 'lwc';

export default class QuanticCardContainer extends LightningElement {
    /**
     * @type {string}
     */
    @api title;
    /**
     * @type {any}
     */
    @api actions;
    @api main-content;
}