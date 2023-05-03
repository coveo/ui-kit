import { getHeadlessBundle } from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';


export default class ActionChangeFieldInput extends LightningElement {
  @api engineId;
  input;
  caseInput;

  handleChangeFieldInputBtnClick() {
    if (!this.input) {
      this.input = this.template.querySelector('lightning-input');
      this.input.value = ''
    }
    if (this.caseInput) {
      this.triggerChangeFieldInput(this.caseInput);
    } else {
      this.resolveCaseInputController().then((controller) => {
        this.caseInput = controller;
        this.triggerChangeFieldInput(this.caseInput);
      })
    }
  }

  triggerChangeFieldInput(controller) {
    const field = this.input ? this.input.value : '';
    const options = {
      caseClassifications: true,
      documentSuggestions: true,
    };
    controller.update(field, options);
  }

  resolveCaseInputController() {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise
      .then((engine) => {
        return this.headless.buildCaseInput(engine, {
          options: {
            field: 'subject'
          }
        });
      });
  }
}