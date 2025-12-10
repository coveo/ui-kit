import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

/**
 * Page object for atomic-facet-manager E2E tests
 */
export class FacetManagerPageObject extends BasePageObject<'atomic-facet-manager'> {
  constructor(page: Page) {
    super(page, 'atomic-facet-manager');
  }

  /**
   * Wait for component to be stable before taking screenshots.
   */
  async waitForVisualStability(): Promise<void> {
    await this.hydrated.waitFor();
    await this.page.evaluate(() => document.fonts.ready);
  }

  /**
   * Capture a screenshot of the component for visual regression testing.
   */
  async captureScreenshot(options?: {
    animations?: 'disabled' | 'allow';
  }): Promise<Buffer> {
    await this.waitForVisualStability();
    return await this.hydrated.screenshot({
      animations: options?.animations ?? 'disabled',
    });
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
