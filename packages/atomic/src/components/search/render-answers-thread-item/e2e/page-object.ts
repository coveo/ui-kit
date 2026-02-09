import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RenderAnswersThreadItemPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'render-answers-thread-item');
  }

  get root(): Locator {
    return this.page.locator('[data-testid="answers-thread-item"]');
  }

  get titleButton(): Locator {
    return this.root.getByRole('button', {name: 'what are they for'});
  }

  get content(): Locator {
    return this.root.locator('[part="content"]');
  }

  get timelineLine(): Locator {
    return this.root.locator('[part="timeline-line"]');
  }
}
