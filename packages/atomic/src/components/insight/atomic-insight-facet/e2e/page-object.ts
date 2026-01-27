import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-facet');
  }

  get facet() {
    return this.page.locator('[part="facet"]');
  }

  get labelButton() {
    return this.page.locator('[part="label-button"]').first();
  }

  get values() {
    return this.page.locator('[part="values"]');
  }

  get expandButtons() {
    return this.page.getByRole('button', {name: /Expand the \w* facet/});
  }

  get facetValue() {
    return this.page.locator('ul[part="values"] > li');
  }

  get facetValueLabel() {
    return this.page.locator('ul[part="values"] > li span[part="value-label"]');
  }

  get facetValueOccurrences() {
    return this.page.locator('ul[part="values"] > li span[part="value-count"]');
  }

  get showMoreButton() {
    return this.page.getByRole('button', {name: 'Show more'});
  }

  get showLessButton() {
    return this.page.getByRole('button', {name: 'Show less'});
  }

  get clearButton() {
    return this.page.getByRole('button', {name: 'Clear filter'});
  }
}
