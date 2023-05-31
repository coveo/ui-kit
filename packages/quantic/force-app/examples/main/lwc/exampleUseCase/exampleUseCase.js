import {api, LightningElement} from 'lwc';
// @ts-ignore
import insightTemplate from './templates/insightTemplate.html';
// @ts-ignore
import searchTemplate from './templates/searchTemplate.html';

export default class ExampleUseCase extends LightningElement {
  @api engineId = '';
  @api useCase = '';

  insightId = '6a333202-b1e0-451e-8664-26a1f93c2faf';

  render() {
    if (this.useCase === 'insight') {
      return insightTemplate;
    }
    return searchTemplate;
  }
}
