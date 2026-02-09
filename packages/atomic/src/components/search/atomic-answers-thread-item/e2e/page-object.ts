import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicAnswersThreadItemPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-answers-thread-item');
  }

  get root(): Locator {
    return this.page.locator(this.tag);
  }

  get titleButton(): Locator {
    return this.page.getByRole('button');
  }

  get content(): Locator {
    return this.root.locator('[part="content"]');
  }

  get timelineLine(): Locator {
    return this.root.locator('[part="timeline-line"]');
  }
}
