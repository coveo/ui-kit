import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticPager extends LightningElement {
  @api engineId = 'quantic-pager-engine';
  @track config = {};
  isConfigured = false;

  searchBoxController;

  pageTitle = 'Quantic Pager';
  pageDescription = 'The Quantic Pager allows users to navigate the search results using pages.';
  options = [
    {
      attribute: 'numberOfPages',
      label: 'Number of pages',
      description: 'The number of pages displayed simultaneously by the pager component.',
      defaultValue: 5,
    }
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }

  handlePerformSearch() {
    if (this.searchBoxController) {
      this.searchBoxController.updateText('');
      this.searchBoxController.submit();
    } else {
      this.getSearchBoxController()
        .then((controller) => {
          this.searchBoxController = controller;
          this.searchBoxController.updateText('');
          this.searchBoxController.submit();
        });
    }
  }

  getSearchBoxController() {
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
