import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceBreadboxPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-breadbox');
  }

  async applyManualNumericalRange(min: number, max: number) {
    const facetLocator = this.page.locator('atomic-commerce-numeric-facet');

    const minInputLocator = facetLocator.getByLabel(
      'Enter a minimum numerical value for the Price facet'
    );

    const maxInputLocator = facetLocator.getByLabel(
      'Enter a maximum numerical value for the Price facet'
    );

    const applyButtonLocator = facetLocator.getByLabel(
      'Apply custom numerical values for the Price facet'
    );

    await minInputLocator.fill(String(min));
    await maxInputLocator.fill(String(max));
    await applyButtonLocator.click();
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
    return this.page.getByLabel(/Show\s*\+\s*\d+\s+more filters/);
  }

  getClearAllButton() {
    return this.page.getByLabel('Clear all filters');
  }

  getShowLessbutton() {
    return this.page.getByRole('button').filter({hasText: /Show less/});
  }
}
