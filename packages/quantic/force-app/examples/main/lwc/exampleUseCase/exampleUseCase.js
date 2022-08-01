import {api, LightningElement} from 'lwc';

export default class ExampleUseCase extends LightningElement {
    @api engineId = '';
    /**
     * @type {boolean}
     */
    @api isSearch;

    insightId = "6a333202-b1e0-451e-8664-26a1f93c2faf";
}
