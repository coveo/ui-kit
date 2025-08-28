import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceRefineModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-refine-modal');
  }

  get closeButton() {
    return this.hydrated.getByRole('button', {name: 'Close'});
  }
}
