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

  get popovers() {
    return this.page.locator('atomic-facet-manager > atomic-popover');
  }

  get visiblePopovers() {
    return this.popovers.filter({visible: true});
  }

  get popoverButtons() {
    return this.popovers.locator('button[part="popover-button"]');
  }

  get popoverLabels() {
    return this.popoverButtons.locator('[part="value-label"]');
  }

  get facetsInPopovers() {
    return this.page.locator('atomic-facet-manager > atomic-popover > atomic-facet');
  }

  get facetsOutsidePopovers() {
    return this.page.locator('atomic-facet-manager > atomic-facet');
  }
}
