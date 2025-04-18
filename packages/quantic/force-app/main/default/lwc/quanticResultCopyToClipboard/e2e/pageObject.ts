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

  async waitForCopyToClipboardClickEvent(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = JSON.parse(requestBody.clickEvent);

        const expectedFields: Record<string, any> = {
          actionCause,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestData?.[key] === expectedFields[key]
        );

        const customData = requestData?.customData;

        return (
          matchesExpectedFields &&
          (customChecker ? customChecker(requestData, customData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }
}
