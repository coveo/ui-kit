import { LightningElement, api } from 'lwc';
import { loadDependencies } from 'c/quanticHeadlessLoader';

export default class ActionFetchClassifications extends LightningElement {
  @api engineId;
  
  headless;
  actions;

  handleFetchClassifications() {
    window.coveoHeadless?.[this.engineId]?.enginePromise
      .then((engine) => {
        this.actions = {
          ...this.headless.loadCaseFieldActions(engine),
        };
        engine.dispatch(this.actions.fetchCaseClassifications());
      });
  }

  connectedCallback() {
    loadDependencies(this, 'case-assist').then((headless) => {
      this.headless = headless;
    })
  }
}