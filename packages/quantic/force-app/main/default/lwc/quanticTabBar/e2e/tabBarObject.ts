import {Locator, Page, Request} from '@playwright/test';
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

  get activeTab(): Locator {
    return this.tabBar.locator('button.slds-tabs_default__item.slds-is-active');
  }

  get moreButton(): Locator {
    return this.tabBar.locator('.tab-bar_more-button');
  }

  get moreButtonLabel(): Locator {
    return this.moreButton.locator('button').first();
  }

  get moreButtonIcon(): Locator {
    return this.moreButton.locator('lightning-icon');
  }

  get dropdownTrigger(): Locator {
    return this.page.locator('.slds-dropdown-trigger');
  }

  get dropdown(): Locator {
    return this.page.locator('.slds-dropdown');
  }

  get allDropdownOptions(): Locator {
    return this.page.locator('.slds-dropdown__item');
  }

  get tabBarContainer(): Locator {
    return this.page.locator('.tab-bar_container');
  }

  async clickTab(tabIndex: number): Promise<void> {
    await this.allTabs.nth(tabIndex).click();
  }

  async clickMoreButton(): Promise<void> {
    await this.moreButton.click();
  }

  async clickDropdownTrigger(): Promise<void> {
    await this.dropdownTrigger.click();
  }

  async clickDropdownOption(optionIndex: number): Promise<void> {
    await this.allDropdownOptions.nth(optionIndex).click();
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
