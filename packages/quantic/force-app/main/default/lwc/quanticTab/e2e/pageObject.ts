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

  get activeTabLabel(): Locator {
    return this.tab
      .locator('button.slds-tabs_default__item.slds-is-active')
      .locator('span.slds-tabs_default__link');
  }

  tabLabel(tabIndex: number): Promise<String | null> {
    return this.tab
      .locator('span.slds-tabs_default__link')
      .nth(tabIndex)
      .textContent();
  }

  async clickTabButton(tabIndex: number): Promise<void> {
    await this.tabButton.nth(tabIndex).click();
  }

  async pressTabThenEnter(): Promise<void> {
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  async pressShiftTabThenSpace(): Promise<void> {
    await this.page.keyboard.down('Shift');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.up('Shift');
    await this.page.keyboard.press('Space');
  }

  async waitForTabUaAnalytics(actionCause): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          actionCause: actionCause,
          originContext: 'Search',
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
