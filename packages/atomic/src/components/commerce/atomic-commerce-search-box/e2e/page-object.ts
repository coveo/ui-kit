import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwrightUtils/base-page-object';

export class SearchBoxPageObject extends BasePageObject<'atomic-commerce-search-box'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box');
  }

  get submitButton() {
    return this.page.getByLabel('Search', {exact: true});
  }

  get searchInput() {
    return this.page.getByRole('combobox', {name: 'Search'});
  }

  searchSuggestions({
    index,
    total,
    listSide,
  }: {index?: number; total?: number; listSide?: 'Left' | 'Right'} = {}) {
    return this.page.getByLabel(
      new RegExp(
        `suggested query\\. ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
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
        `instant result\\. ${index ?? '\\d'} of ${total ?? '\\d'}\\.${this.listSideAffix(listSide)}`
      )
    );
  }

  private listSideAffix(listSide?: 'Left' | 'Right') {
    return listSide ? ` In ${listSide} list\\.` : '';
  }
}
