import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommerceBreadboxPageObject extends BasePageObject<'atomic-commerce-breadbox'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-breadbox');
  }

  getFacetValue(
    facetType:
      | 'regular'
      | 'category'
      | 'nestedCategory'
      | 'numerical'
      | 'dateRange',
    value?: string | RegExp
  ) {
    const facetTypeLocators = {
      regular: 'atomic-commerce-facet',
      category: 'atomic-commerce-category-facet',
      nestedCategory: 'atomic-commerce-category-facet [part="values"]',
      numerical: 'atomic-commerce-numeric-facet',
      dateRange: 'atomic-commerce-timeframe-facet',
    };

    const baseLocator = this.page
      .locator(facetTypeLocators[facetType])
      .getByRole('listitem');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.getByLabel('Remove Inclusion filter on', {
      exact: false,
    });
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getShowMorebutton() {
    return this.page.getByLabel(/Show \d+ more filters/);
  }

  getClearAllButton() {
    return this.page.getByLabel('Clear all filters');
  }

  getShowLessbutton() {
    return this.page.getByRole('button').filter({hasText: /Show less/});
  }
}
