import type {Locator, Page, Request} from '@playwright/test';
import {isUaClickEvent} from '../../../../../../playwright/utils/requests';

export class ResultQuickviewObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get quickviewButton(): Locator {
    return this.page.getByRole('button', {name: 'Open'});
  }

  get quickviewContent(): Locator {
    return this.page
      .locator('c-quantic-quickview-content iframe')
      .contentFrame()
      .locator('div');
  }

  get quickviewFooter(): Locator {
    return this.page.locator('slot[name="footer"]');
  }

  async receivedEvents(): Promise<Array<string>> {
    return this.page.locator('.event__received').allTextContents();
  }

  async waitForQuickviewClickEvent(): Promise<Request> {
    return this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const clickEvent = JSON.parse(requestBody?.clickEvent);
        return clickEvent?.actionCause === 'documentQuickview';
      }
      return false;
    });
  }
}
