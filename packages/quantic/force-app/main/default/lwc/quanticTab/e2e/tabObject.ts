import {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class TabObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get tab(): Locator {
    return this.page.locator('c-quantic-tab');
  }

  get tabButton(): Locator {
    return this.tab.locator('button.slds-tabs_default__item.tab_button');
  }

  get activeTabButton(): Locator {
    return this.tab.locator('button.slds-tabs_default__item.slds-is-active');
  }

  async clickTabButton(tabIndex: number): Promise<void> {
    await this.tabButton.nth(tabIndex).click();
  }

  async waitForTabUaAnalytics(actionCause): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          actionCause: actionCause,
        };
        return Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForTabSelectUaAnalytics(): Promise<Request> {
    return this.waitForTabUaAnalytics('interfaceChange');
  }
}
