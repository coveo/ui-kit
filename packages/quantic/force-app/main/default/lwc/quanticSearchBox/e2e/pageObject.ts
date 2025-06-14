import type {Locator, Page, Request} from '@playwright/test';
import {
  AnalyticsMode,
  AnalyticsModeEnum,
} from '../../../../../../playwright/utils/analyticsMode';
import {AnalyticsObject} from '../../../../../../playwright/page-object/analytics';

export class SearchBoxObject {
  private analyticsMode: AnalyticsMode;

  constructor(
    public page: Page,
    private analytics: AnalyticsObject,
  ) {
    this.page = page;
    this.analytics = analytics;
    this.analyticsMode = this.analytics.analyticsMode;
  }

  get searchBox(): Locator {
    return this.page.locator('c-quantic-search-box');
  }
}