import {api, LightningElement} from 'lwc';

export default class ActionAddFacetsWithoutInputs extends LightningElement {
  @api engineId;
  @api disabled;
  @api withInput = false;

  searchBox;
  input;

  handlePerformSearch() {
    const event = new CustomEvent('addFacetsWithoutInputs', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
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
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return CoveoHeadless.buildSearchBox(engine, {
          options: {
            numberOfSuggestions: 0,
          },
        });
      }
    );
  }
}
