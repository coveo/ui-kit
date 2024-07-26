import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommerceRecommendationList extends BasePageObject<'atomic-commerce-recommendation-list'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-recommendation-list');
  }
}
