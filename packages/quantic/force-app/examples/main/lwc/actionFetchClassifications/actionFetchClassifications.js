import { LightningElement, api } from 'lwc';

export default class ActionFetchClassifications extends LightningElement {
  @api engineId;
  
  actions;

  handleFetchClassifications() {
    window.coveoHeadless?.[this.engineId]?.enginePromise
      .then((engine) => {
        this.actions = {
          ...CoveoHeadlessCaseAssist.loadCaseFieldActions(engine),
        };
        console.log(this.actions.fetchCaseClassifications)
        console.log(engine)
        engine.dispatch(this.actions.fetchCaseClassifications());
      });
  }
}