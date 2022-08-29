import {api, LightningElement} from 'lwc';

export default class ActionAddFacets extends LightningElement {
  @api engineId;
  @api disabled;

  searchBox;

  handlePerformSearch() {
    const addFacetsEvent = new CustomEvent('addFacets', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(addFacetsEvent);

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
    const query = '';
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
