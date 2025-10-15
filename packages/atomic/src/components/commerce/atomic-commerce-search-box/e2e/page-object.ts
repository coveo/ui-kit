import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SearchBoxPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box');
  }

  get component() {
    return this.page.locator('atomic-commerce-search-box');
  }

  get submitButton() {
    return this.component.getByLabel('Search', {exact: true});
  }

  get searchInput() {
    return this.component.getByPlaceholder('Search');
  }

  get clearButton() {
    return this.component.getByLabel('Clear search-box', {exact: true});
  }

  get ariaLive() {
    return this.page.locator('atomic-aria-live');
  }

  get clearRecentQueriesButton() {
    return this.component.getByLabel('Clear recent searches.').first();
  }

  get numberOfQueries() {
    return this.component.getAttribute('number-of-queries');
  }

  searchSuggestions({
    index,
    total,
    listSide,
  }: {
    index?: number;
    total?: number;
    listSide?: 'Left' | 'Right';
  } = {}) {
    return this.page.getByLabel(
      new RegExp(
        `suggested query\\.(?: Button\\.)? ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  recentQueries({
    index,
    total,
    listSide,
  }: {
    index?: number;
    total?: number;
    listSide?: 'Left' | 'Right';
  } = {}) {
    return this.page.getByLabel(
      new RegExp(
        `recent query\\.(?: Button\\.)? ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  instantProduct({
    index,
    total,
    listSide,
  }: {
    index?: number;
    total?: number;
    listSide?: 'Left' | 'Right';
  } = {}) {
    return this.page.getByLabel(
      new RegExp(
        `instant product\\.(?: Button\\.)? ${index ?? '\\d{1,2}'} of ${total ?? '\\d{1,2}'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  private listSideAffix(listSide?: 'Left' | 'Right') {
    return listSide ? ` In ${listSide} list\\.` : '';
  }
}
