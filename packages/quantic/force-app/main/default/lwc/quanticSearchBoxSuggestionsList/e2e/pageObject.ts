import type {Locator, Page, Request} from '@playwright/test';
import {
  AnalyticsMode,
  AnalyticsModeEnum,
} from '../../../../../../playwright/utils/analyticsMode';
import {AnalyticsObject} from '../../../../../../playwright/page-object/analytics';

export class SearchBoxSuggestionsListObject {
  private analyticsMode: AnalyticsMode;

  constructor(
    public page: Page,
    private analytics: AnalyticsObject
  ) {
    this.page = page;
    this.analytics = analytics;
    this.analyticsMode = this.analytics.analyticsMode;
  }

  get searchBoxSuggestionsList(): Locator {
    return this.page.locator('c-quantic-search-box-suggestions-list');
  }

  get searchBoxInput(): Locator {
    return this.page.getByTestId('search-box-input');
  }

  get suggestionsList(): Locator {
    return this.searchBoxSuggestionsList.getByRole('listbox');
  }

  get firstSuggestion(): Locator {
    return this.suggestionsList.getByRole('option').first();
  }

  get suggestionCount(): Promise<number> {
    return this.suggestionsList.getByRole('option').count();
  }

  get clearRecentQueriesButton(): Locator {
    return this.page.getByTestId('clear-recent-queries-button');
  }

  getSuggestionAtIndex(index: number): Locator {
    return this.suggestionsList.getByRole('option').nth(index);
  }

  getSuggestionByText(text: string): Locator {
    return this.suggestionsList.getByRole('option').filter({
      hasText: text,
    });
  }

  async focusOutsideSearchBox(): Promise<void> {
    await this.page.locator('body').click();
  }

  async waitForQuerySuggestSearchLegacyAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForSearchUaAnalytics(
        'omniboxAnalytics',
        (data: Record<string, any>) => {
          return Object.keys(expectedFields).every(
            (key) => data?.[key] === expectedFields[key]
          );
        }
      );
    }
    throw new Error(
      `Analytics mode ${this.analyticsMode} is not supported for clear recent queries analytics`
    );
  }

  async waitForRecentQuerySearchLegacyAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForSearchUaAnalytics(
        'recentQueriesClick',
        (data: Record<string, any>) => {
          return Object.keys(expectedFields).every(
            (key) => data?.[key] === expectedFields[key]
          );
        }
      );
    }
    throw new Error(
      `Analytics mode ${this.analyticsMode} is not supported for clear recent queries analytics`
    );
  }

  async waitForClearRecentQueriesAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'recentQueries',
          eventValue: 'clearRecentQueries',
        },
        (event) =>
          Object.keys(expectedFields).every(
            (key) => event?.[key] === expectedFields[key]
          )
      );
    }
    throw new Error(
      `Analytics mode ${this.analyticsMode} is not supported for clear recent queries analytics`
    );
  }
}
