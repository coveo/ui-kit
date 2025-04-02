import {api, LightningElement} from 'lwc';

export default class ExampleLayout extends LightningElement {
  @api title = '';
  @api description = '';
  @api showPreview = false;
  @api expectedEvents = [];
}
