import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class QuickviewModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-quickview-modal');
  }

  async waitForVisualStability(): Promise<void> {
    await this.hydrated.waitFor();
    await this.page.evaluate(() => document.fonts.ready);
  }

  async captureScreenshot(options?: {
    animations?: 'disabled' | 'allow';
  }): Promise<Buffer> {
    await this.waitForVisualStability();
    return await this.hydrated.screenshot({
      animations: options?.animations ?? 'disabled',
    });
  }

  get modal() {
    return this.page.locator('atomic-modal');
  }

  get modalContainer() {
    return this.modal.locator('[part="container"]');
  }

  get header() {
    return this.modal.locator('[slot="header"]');
  }

  get body() {
    return this.modal.locator('[slot="body"]');
  }

  get footer() {
    return this.modal.locator('[slot="footer"]');
  }

  get titleLink() {
    return this.header.getByRole('link');
  }

  get closeButton() {
    return this.page.getByLabel('Close');
  }

  get previousButton() {
    return this.page.getByRole('button', {name: 'Previous quickview'});
  }

  get nextButton() {
    return this.page.getByRole('button', {name: 'Next quickview'});
  }

  get sidebar() {
    return this.body.locator('.h-full.overflow-y-auto').first();
  }

  get iframeContainer() {
    return this.body.locator('.relative.overflow-auto');
  }

  get pagerText() {
    return this.footer.locator('p.text-center');
  }

  get backdrop() {
    return this.modal.locator('[part="backdrop"]');
  }
}
