import type {Page} from '@playwright/test';

export class AtomicCommerceSearchBoxLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get submitButton() {
    return this.page.getByLabel('Search', {exact: true});
  }

  get searchInput() {
    return this.page.getByRole('combobox', {name: 'Search'});
  }

  get clearRecentQueriesButton() {
    return this.page.getByLabel('Clear recent searches.');
  }

  searchSuggestions({
    index,
    total,
    listSide,
  }: {index?: number; total?: number; listSide?: 'Left' | 'Right'} = {}) {
    return this.page.getByLabel(
      new RegExp(
        `suggested query\\.(?: Button\\.) ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  recentQueries({
    index,
    total,
    listSide,
  }: {index?: number; total?: number; listSide?: 'Left' | 'Right'} = {}) {
    return this.page.getByLabel(
      new RegExp(
        `recent query\\.(?: Button\\.) ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  instantResult({
    index,
    total,
    listSide,
  }: {index?: number; total?: number; listSide?: 'Left' | 'Right'} = {}) {
    return this.page.getByLabel(
      new RegExp(
        `instant result\\.(?: Button\\.) ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-search-box[class*="hydrated"]');
  }

  private listSideAffix(listSide?: 'Left' | 'Right') {
    return listSide ? ` In ${listSide} list\\.` : '';
  }
}
