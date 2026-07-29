import {LightningElement, api} from 'lwc';

export default class ExampleSearchAgent extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-search-agent';
  /** @type {string} */
  @api accessToken = 'xxcae0cb1a-cedf-4899-a61e-7aad0aa62a2f';
  /** @type {string} */
  @api organizationId = 'searchuisamples';
  /** @type {string} */
  @api searchHub = 'default';
  /** @type {string} */
  @api pipeline = 'genqatest';
  /** @type {boolean} */
  @api disableStateInUrl = false;
  /** @type {boolean} */
  @api skipFirstSearch = false;
  /** @type {string} */
  @api agentId = '5fd0b5ea-d368-488e-bdeb-f6221ec0fb98';
}
