import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AnyFacetPageObject extends BasePageObject {
  get searchInput() {
    return this.page.getByPlaceholder('Search');
  }

  get clearSearchInput() {
    return this.page.getByRole('button', {name: 'Clear'});
  }

  get showMore() {
    return this.page.getByLabel('Show more values');
  }

  get showLess() {
    return this.page.getByLabel('Show less values');
  }
}
