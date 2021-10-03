import {LightningElement, api} from 'lwc';

export default class QuanticBreadcrumb extends LightningElement {
  @api value;
  @api deselect;
  @api altText;
}
