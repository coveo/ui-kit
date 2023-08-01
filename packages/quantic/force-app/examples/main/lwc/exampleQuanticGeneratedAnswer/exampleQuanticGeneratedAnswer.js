import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticGeneratedAnswer extends LightningElement {
  @api engineId = 'quantic-generated-answer-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Generated Answer';
  pageDescription =
    'The QuanticGeneratedAnswer component is responsible for displaying query results by applying one or more result templates.';
  options = [
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
