import type {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class TabBarObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get tabBar(): Locator {
    return this.page.locator('c-quantic-tab-bar');
  }

  get allTabs(): Locator {
    return this.tabBar.locator('c-quantic-tab');
  }

  get allVisibleTabs(): Locator {
    return this.tabBar.locator('c-quantic-tab').filter({
      has: this.page.locator(':visible'),
    });
  }

  get activeTab(): Locator {
    return this.tabBar.locator('c-quantic-tab').filter({
      has: this.page.locator('.slds-is-active'),
    });
  }

  get moreButton(): Locator {
    return this.tabBar.getByTestId('tab-bar_more-button');
  }

  get dropdownContainer(): Locator {
    return this.page.getByTestId('tab-bar_dropdown-container');
  }

  get allDropdownOptions(): Locator {
    return this.page.getByTestId('tab-bar_dropdown-item');
  }

  get tabBarContainer(): Locator {
    return this.page.locator('.tab-bar_container');
  }

  get tabBarDropdown(): Locator {
    return this.tabBar.locator('.tab-bar_dropdown');
  }

  async clickMoreButton(): Promise<void> {
    await this.moreButton.click();
  }

  async clickDropdownOption(optionIndex: number): Promise<void> {
    await this.allDropdownOptions.nth(optionIndex).click();
  }

  async clickComponentContainer(): Promise<void> {
    await this.tabBarContainer.click();
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

  async waitForDropdownOptionSelectUaAnalytics(): Promise<Request> {
    return this.waitForTabUaAnalytics('interfaceChange');
  }
}
