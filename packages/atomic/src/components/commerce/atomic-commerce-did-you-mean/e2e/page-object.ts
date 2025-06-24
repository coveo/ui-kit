import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class AtomicCommerceDidYouMeanPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-did-you-mean');
  }
}
