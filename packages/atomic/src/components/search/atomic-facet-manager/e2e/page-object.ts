import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

/**
 * Page object for atomic-facet-manager E2E tests
 */
export class FacetManagerPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-facet-manager');
  }
  /**
   * Get all facet elements within the manager
   */
  get facets() {
    return this.page.locator('atomic-facet');
  }

  /**
   * Get facets that are collapsed
   */
  get collapsedFacets() {
    return this.page.locator('atomic-facet[is-collapsed]');
  }

  /**
   * Get facets that are expanded
   */
  get expandedFacets() {
    return this.page.locator('atomic-facet:not([is-collapsed])');
  }
}
