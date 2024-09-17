import {LightningElement, api} from 'lwc';

// For the 'genqatest' query pipeline, the following query should yield a relevant generated answer: How to resolve netflix connection with tivo?

export default class ExampleRelevantGenerativeAnswering extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-relevant-generative-answering';
  /** @type {string} */
  @api searchHub = 'default';
  /** @type {string} */
  @api pipeline = 'genqatest';
  /** @type {boolean} */
  @api disableStateInUrl = false;
  /** @type {boolean} */
  @api skipFirstSearch = false;
}
