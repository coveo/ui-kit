import {api, LightningElement} from 'lwc';

export default class ExampleLayout extends LightningElement {
    @api engineId = '';
    @api isSearch = false;
}
