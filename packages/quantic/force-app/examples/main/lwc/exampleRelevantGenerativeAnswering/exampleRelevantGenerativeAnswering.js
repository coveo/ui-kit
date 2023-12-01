// @ts-ignore
import 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

export default class ExampleRelevantGenerativeAnswering extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-relevant-generative-answering';

  connectedCallback() {}

  disconnectedCallback() {}

  // handleInterfaceLoad = (event) => {
  //   event.stopPropagation();
  //   getHeadlessEnginePromise(this.engineId).then((engine) => {
  //     engine.executeFirstSearch();
  //   });
  // };

  handleResultTemplateRegistration(event) {
    // const headless = getHeadlessBundle(this.engineId);
    event.stopPropagation();

    const resultTemplatesManager = event.detail;

    resultTemplatesManager.registerTemplates();
  }
}
