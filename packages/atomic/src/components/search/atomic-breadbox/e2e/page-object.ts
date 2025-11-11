import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicBreadboxPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-breadbox');
  }

  get ratingFacet() {
    return this.page.getByRole('checkbox', {
      name: 'Inclusion filter on one star',
    });
  }

  get ratingBreadcrumb() {
    return this.page.getByRole('button', {
      name: 'Remove inclusion filter on Rating: one star out of',
    });
  }

  getFacetValue(
    facetType: 'objecttype' | 'filetype' | 'source',
    value?: string | RegExp
  ) {
    const facetTypeLocators = {
      objecttype: 'atomic-facet[field="objecttype"]',
      filetype: 'atomic-facet[field="filetype"]',
      source: 'atomic-facet[field="source"]',
    };

    const facetSelector = facetTypeLocators[facetType];
    const facet = this.page.locator(facetSelector);

    const baseLocator = facet.getByRole('listitem');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.getByLabel('Remove inclusion filter on', {
      exact: false,
    });
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getShowMoreButton() {
    return this.page.getByLabel(/Show\s*\+\s*\d+\s+more filters/);
  }

  getClearAllButton() {
    return this.page.getByLabel('Clear All Filters');
  }

  getShowLessButton() {
    return this.page.getByRole('button').filter({hasText: /Show less/});
  }
}
