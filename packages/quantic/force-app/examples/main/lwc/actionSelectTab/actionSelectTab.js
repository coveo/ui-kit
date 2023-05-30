import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionSelectTab extends LightningElement {
  @api engineId;
  @api disabled;
  @api expression;

  tab;
  headless;

  handleSelectTab() {
    if (this.tab) {
      this.tab.select();
    } else {
      this.resolveTabController().then((controller) => {
        this.tab = controller;
        this.tab.select();
      });
    }
  }

  resolveTabController() {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return this.headless.buildTab(engine, {
          options: {
            expression: this.expression ?? '',
            id: 'Tab',
          },
          initialState: {
            isActive: false,
          },
        });
      }
    );
  }
}
