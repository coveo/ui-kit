import type {Locator, Page, Request} from '@playwright/test';
import {
  AnalyticsMode,
  AnalyticsModeEnum,
} from '../../../../../../playwright/utils/analyticsMode';
import {AnalyticsObject} from '../../../../../../playwright/page-object/analytics';

export class RecentResultsListObject {
  private analyticsMode: AnalyticsMode;

  constructor(
    public page: Page,
    private analytics: AnalyticsObject
  ) {
    this.page = page;
    this.analytics = analytics;
    this.analyticsMode = this.analytics.analyticsMode;
  }

  get recentResultsList(): Locator {
    return this.page.locator('c-quantic-recent-results-list');
  }

  get recentResultListItemLinks(): Locator {
    return this.page.locator('c-quantic-recent-result-link');
  }

  get selectResultButton(): Locator {
    return this.page.locator('c-action-select-results button');
  }

  async clickSelectResultButton(): Promise<void> {
    await this.selectResultButton.click();
  }

  getRecentResultLinkByIndex(index: number): Locator {
    return this.recentResultListItemLinks.nth(index);
  }

  async waitForRecentResultClickAnalytics(
    expectedCustomMetadata: Record<string, any>
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'recentlyClickedDocuments',
          eventValue: 'recentResultClick',
        },
        (event) =>
          Object.keys(expectedCustomMetadata).every(
            (key) =>
              // @ts-ignore
              event?.customData?.info?.[key] === expectedCustomMetadata[key]
          )
      );
    }
    throw new Error(
      `Analytics mode ${this.analyticsMode} is not supported for click recent result analytics`
    );
  }
}
