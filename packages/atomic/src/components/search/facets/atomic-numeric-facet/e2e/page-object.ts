import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

/**
 * Page object for atomic-numeric-facet E2E tests.
 * Note: atomic-numeric-facet is still Stencil, so we use base-page-object.
 * The nested atomic-facet-number-input is Lit, but we test it through the parent.
 */
export class AtomicNumericFacetPageObject extends BasePageObject<'atomic-numeric-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-numeric-facet');
  }

  get facet() {
    return this.page.locator('atomic-numeric-facet');
  }

  get facetInputStart() {
    return this.facet.getByLabel('Enter a minimum numerical value');
  }

  get facetInputEnd() {
    return this.facet.getByLabel('Enter a maximum numerical value');
  }

  get facetApplyButton() {
    return this.facet.getByLabel('Apply custom numerical values');
  }

  get facetClearFilterButton() {
    return this.facet.getByRole('button').filter({hasText: 'Clear filter'});
  }

  get facetValues() {
    return this.facet.locator('[part="value-checkbox"]');
  }

  get numberInput() {
    return this.facet.locator('atomic-facet-number-input');
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
}
