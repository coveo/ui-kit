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

  /**
   * Get the popovers that are direct children of the manager
   */
  get popovers() {
    return this.page.locator('atomic-facet-manager > atomic-popover');
  }

  /**
   * Get the buttons that open the popovers, in the order the popovers appear in the manager
   */
  get popoverButtons() {
    return this.popovers.locator('button[part="popover-button"]');
  }

  /**
   * Get the labels of the popover buttons, in the order the popovers appear in the manager
   */
  get popoverLabels() {
    return this.popoverButtons.locator('[part="value-label"]');
  }

  /**
   * Get the facets that are slotted inside a popover of the manager
   */
  get facetsInPopovers() {
    return this.page.locator('atomic-facet-manager > atomic-popover > atomic-facet');
  }

  /**
   * Get the facets that are direct children of the manager
   */
  get facetsOutsidePopovers() {
    return this.page.locator('atomic-facet-manager > atomic-facet');
  }
}
