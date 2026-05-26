import {LightningElement, api} from 'lwc';

export default class QuanticSourceCitations extends LightningElement {
  @api engineId;
  @api citations;
  @api citationHoverHandler;
  @api disableCitationAnchoring;
}
