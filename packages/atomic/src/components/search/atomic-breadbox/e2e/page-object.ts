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
    facetType: 'objecttype' | 'filetype' | 'source' | 'author',
    value?: string | RegExp
  ) {
    const facetTypeLocators = {
      objecttype: 'atomic-facet[field="objecttype"]',
      filetype: 'atomic-facet[field="filetype"]',
      source: 'atomic-facet[field="source"]',
      author: 'atomic-facet[field="author"]',
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

  getExclusionBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.getByLabel('Remove exclusion filter on', {
      exact: false,
    });
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }

  getCategoryFacetValues(field = 'geographicalhierarchy') {
    return this.page.locator(
      `atomic-category-facet[field="${field}"] button[part="value-link"]`
    );
  }

  getColorFacetValues(field = 'color') {
    return this.page.locator(
      `atomic-color-facet[field="${field}"] button[part="value-box"]`
    );
  }

  getTimeframeFacetValues() {
    return this.page.locator(
      'atomic-timeframe-facet button[part="value-link"]'
    );
  }

  getNumericFacetInputs(field = 'price') {
    return {
      min: this.page.locator(
        `atomic-numeric-facet[field="${field}"] input[part="input-start"]`
      ),
      max: this.page.locator(
        `atomic-numeric-facet[field="${field}"] input[part="input-end"]`
      ),
      apply: this.page.locator(
        `atomic-numeric-facet[field="${field}"] button[part="apply-button"]`
      ),
    };
  }

  async selectFacetValueByIndex(
    facetType: 'objecttype' | 'filetype' | 'source' | 'author',
    index: number
  ) {
    const facetValues = this.getFacetValue(facetType);
    await facetValues.nth(index).waitFor({state: 'visible', timeout: 10000});
    await facetValues.nth(index).click();
  }

  getAutomaticFacetValues() {
    return this.page.locator(
      'atomic-automatic-facet button[part="value-checkbox"]'
    );
  }

  async selectAutomaticFacetValue(index: number) {
    const automaticValues = this.getAutomaticFacetValues();
    await automaticValues
      .nth(index)
      .waitFor({state: 'visible', timeout: 10000});
    await automaticValues.nth(index).click();
  }

  getExcludeButtons(facetType?: string) {
    const selector = facetType
      ? `atomic-facet[field="${facetType}"] button[aria-label*="Exclude"]`
      : 'button[aria-label*="Exclude"]';
    return this.page.locator(selector);
  }

  async excludeFacetValue(
    facetType: 'objecttype' | 'filetype' | 'source' | 'author',
    index: number
  ) {
    const excludeButtons = this.getExcludeButtons(facetType);
    await excludeButtons.nth(index).waitFor({state: 'visible', timeout: 10000});
    await excludeButtons.nth(index).click();
  }

  async selectCategoryFacetValue(index: number) {
    const categoryValues = this.getCategoryFacetValues();
    await categoryValues.nth(index).waitFor({state: 'visible', timeout: 10000});
    await categoryValues.nth(index).click();
  }

  async selectColorFacetValue(index: number) {
    const colorValues = this.getColorFacetValues();
    await colorValues.nth(index).waitFor({state: 'visible', timeout: 10000});
    await colorValues.nth(index).click();
  }

  async selectTimeframeFacetValue(index: number) {
    const timeframeValues = this.getTimeframeFacetValues();
    await timeframeValues
      .nth(index)
      .waitFor({state: 'visible', timeout: 10000});
    await timeframeValues.nth(index).click();
  }
}
