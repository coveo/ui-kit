import { LightningElement, api } from 'lwc';

export default class SectionTitle extends LightningElement {
  /**
   * The section title
   * @type {string}
   */
  @api title = 'Which product is related to your problem?'
}