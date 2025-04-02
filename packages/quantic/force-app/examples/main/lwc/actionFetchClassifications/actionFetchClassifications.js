import {LightningElement, api} from 'lwc';

export default class ActionFetchClassifications extends LightningElement {
  @api engineId;

  actions;

  handleFetchClassifications() {
    window.coveoHeadless?.[this.engineId]?.enginePromise.then((engine) => {
      this.actions = {
        ...CoveoHeadlessCaseAssist.loadCaseFieldActions(engine),
      };
      engine.dispatch(this.actions.fetchCaseClassifications());
    });
  }
}
