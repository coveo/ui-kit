import type {Locator, Page, Request, Response} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class TabObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get tab(): Locator {
    return this.page.locator('c-quantic-tab');
  }

  tabButton(tabLabel): Locator {
    return this.tab.getByRole('button', {name: new RegExp(`^${tabLabel}$`)});
  }

  get activeTabLabel(): Promise<string | null> {
    return this.tab.locator('button.slds-is-active').textContent();
  }

  async clickTabButton(tabLabel: string): Promise<void> {
    await this.tabButton(tabLabel).click();
  }

  async waitForTabSearchUaAnalytics(
    actionCause,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields = {
          actionCause: actionCause,
          originContext: 'Search',
        };
        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        return (
          matchesExpectedFields &&
          (customChecker ? customChecker(customData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForTabSelectUaAnalytics(expectedFields: object): Promise<Request> {
    return this.waitForTabSearchUaAnalytics(
      'interfaceChange',
      (customData: object) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  extractActionCauseFromSearchResponse(response: Response) {
    const {analytics} = response.request().postDataJSON();
    return analytics.actionCause;
  }
}
