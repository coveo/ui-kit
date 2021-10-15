import { api, LightningElement } from 'lwc';

export default class ActionPerformSearch extends LightningElement {
  @api engineId;
  @api disabled;

  searchBox;

  handlePerformSearch() {
    if (this.searchBox) {
      this.triggerSearch(this.searchBox);
    } else {
      this.resolveSearchBoxController()
        .then((controller) => {
          this.searchBox = controller;
          this.triggerSearch(this.searchBox);
        });
    }
  }

  triggerSearch(controller) {
    controller.updateText('');
    controller.submit();
  }

  resolveSearchBoxController() {
    return window.coveoHeadless?.[this.engineId]?.enginePromise
      .then((engine) => {
        return CoveoHeadless.buildSearchBox(engine, {
          options: {
            numberOfSuggestions: 0
          }
        });
      });
  }
}
