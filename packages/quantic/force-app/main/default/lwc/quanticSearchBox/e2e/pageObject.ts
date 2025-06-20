import type {Locator, Page, Request} from '@playwright/test';
import {AnalyticsMode} from '../../../../../../playwright/utils/analyticsMode';
import {AnalyticsObject} from '../../../../../../playwright/page-object/analytics';

export class SearchBoxObject {
  private analyticsMode: AnalyticsMode;

  constructor(
    public page: Page,
    private analytics: AnalyticsObject
  ) {
    this.page = page;
    this.analytics = analytics;
    this.analyticsMode = this.analytics.analyticsMode;
  }

  get searchBox(): Locator {
    return this.page.locator('c-quantic-search-box');
  }

  get searchBoxInput(): Locator {
    return this.searchBox.getByTestId('search-box-input');
  }

  get searchBoxTextArea(): Locator {
    return this.searchBox.getByTestId('search-box-textarea');
  }

  async focusOutsideSearchBox(): Promise<void> {
    await this.page.locator('body').click();
  }

  async waitForSearchLegacyAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.analytics.waitForSearchUaAnalytics(
      'searchboxSubmit',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }
}
