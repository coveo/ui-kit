import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionSelectTab extends LightningElement {
  @api engineId;
  @api disabled;
  @api expression;

  tab;
  headless;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.tab = this.headless.buildTab(engine, {
      options: {
        expression: this.expression ?? '',
        id: 'Tab',
      },
      initialState: {
        isActive: false,
      },
    });
  };

  handleSelectTab() {
    this.tab?.select();
  }
}
