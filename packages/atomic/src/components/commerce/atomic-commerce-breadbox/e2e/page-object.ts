import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommerceBreadboxPageObject extends BasePageObject<'atomic-commerce-breadbox'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-breadbox');
  }

  getRegularFacetValue(value?: string | RegExp) {
    const baseLocator = this.page.locator(
      'atomic-commerce-facet [part="value-label"]'
    );
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getCategoryFacetValue(value?: string | RegExp) {
    const baseLocator = this.page.locator(
      'atomic-commerce-category-facet [part="value-label"]'
    );
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getNumericalFacetValue(value?: string | RegExp) {
    const baseLocator = this.page.locator(
      'atomic-commerce-numeric-facet [part="value-label"]'
    );
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }
  getDateRangeFacetValue(value?: string | RegExp) {
    const baseLocator = this.page.locator(
      'atomic-commerce-timeframe-facet [part="value-label"]'
    );
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.locator('[part="breadcrumb-button"]:visible');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getShowMorebutton() {
    return this.page.locator('[part="breadcrumb-list"] [part="show-more"]');
  }

  getClearAllButton() {
    return this.page.locator('[part="breadcrumb-list"] [part="clear"]');
  }

  getShowLessbutton() {
    return this.page.locator('[part="breadcrumb-list"] [part="show-less"]');
  }
}
