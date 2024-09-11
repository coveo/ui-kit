import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class SearchBoxPageObject extends BasePageObject<'atomic-commerce-search-box'> {
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
    return this.component.getByLabel('Clear', {exact: true});
  }

  get ariaLive() {
    return this.page.locator('atomic-aria-live');
  }

  get clearRecentQueriesButton() {
    return this.component.getByLabel('Clear recent searches.');
  }

  get numberOfQueries() {
    return this.component.getAttribute('number-of-queries');
  }

  searchSuggestions({
    index,
    total,
    listSide,
  }: {index?: number; total?: number; listSide?: 'Left' | 'Right'} = {}) {
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
  }: {index?: number; total?: number; listSide?: 'Left' | 'Right'} = {}) {
    return this.page.getByLabel(
      new RegExp(
        `recent query\\.(?: Button\\.)? ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
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
        `instant result\\.(?: Button\\.)? ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  private listSideAffix(listSide?: 'Left' | 'Right') {
    return listSide ? ` In ${listSide} list\\.` : '';
  }
}
