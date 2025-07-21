import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicCommerceBreadboxPageObject extends BasePageObject<'atomic-breadbox'> {
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
}
