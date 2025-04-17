import type {Locator, Page, Request} from '@playwright/test';
import {isUaClickEvent} from '../../../../../../playwright/utils/requests';

export class ResultCopyToClipboard {
  constructor(public page: Page) {
    this.page = page;
  }

  get resultCopyToClipboard(): Locator {
    return this.page.locator('c-quantic-result-copy-to-clipboard');
  }

  get copyToClipboardButton(): Locator {
    return this.resultCopyToClipboard.locator('lightning-button-icon-stateful');
  }

  get copyToClipboardTooltip(): Locator {
    return this.resultCopyToClipboard.locator('.slds-popover');
  }

  async waitForCopyToClipboardClickEvent(): Promise<Request> {
    return this.page.waitForRequest((request) => {
      return isUaClickEvent(request) ? true : false;
    });
  }
}
