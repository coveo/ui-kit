import {LightningElement, api} from 'lwc';

export default class ActionChangeFieldInput extends LightningElement {
  @api engineId;
  // const field value, field name --> check headless for that
  actions;

  handleChangeFieldInput() {
    window.coveoHeadless?.[this.engineId]?.enginePromise.then((engine) => {
      this.actions = {
        ...CoveoHeadlessCaseAssist.loadCaseInputActions(engine),
      };
      engine.dispatch(this.actions.updateCaseInput('payload')); // TO DO --> pass right payload
    });
  }
}
