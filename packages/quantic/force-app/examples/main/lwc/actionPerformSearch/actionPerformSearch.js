import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionPerformSearch extends LightningElement {
  @api engineId;
  @api disabled;
  @api withInput = false;

  searchBox;
  input;
  headless;

  handlePerformSearch() {
    if (!this.input && this.withInput) {
      this.input = this.template.querySelector('lightning-input');
    }
    if (this.searchBox) {
      this.triggerSearch(this.searchBox);
    } else {
      this.resolveSearchBoxController().then((controller) => {
        this.searchBox = controller;
        this.triggerSearch(this.searchBox);
      });
    }
  }

  triggerSearch(controller) {
    const query = this.input ? this.input.value : '';
    controller.updateText(query);
    controller.submit();
  }

  resolveSearchBoxController() {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return this.headless.buildSearchBox(engine, {
          options: {
            numberOfSuggestions: 0,
          },
        });
      }
    );
  }
}
