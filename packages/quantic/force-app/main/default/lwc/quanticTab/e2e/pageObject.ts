import type {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class TabObject {
  constructor(
    public page: Page,
    public useCase: 'search' | 'insight' = 'search'
  ) {
    this.page = page;
    this.useCase = useCase;
  }

  get tab(): Locator {
    return this.page.locator('c-quantic-tab');
  }

  tabButton(tabLabel: string): Locator {
    return this.tab.getByRole('button', {name: new RegExp(`^${tabLabel}$`)});
  }

  get activeTabLabel(): Promise<string | null> {
    return this.tab.locator('button.slds-is-active').textContent();
  }

  async clickTabButton(tabLabel: string): Promise<void> {
    await this.tabButton(tabLabel).click();
  }

  async waitForTabSearchUaAnalytics(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields: Record<string, any> = {
          actionCause: actionCause,
          originContext: this.useCase === 'search' ? 'Search' : 'InsightPanel',
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

  async waitForTabSelectUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForTabSearchUaAnalytics(
      'interfaceChange',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }
}
