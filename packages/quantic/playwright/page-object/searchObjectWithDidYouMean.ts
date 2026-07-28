import {Page} from '@playwright/test';
import * as searchResponses from '@coveo/platform-mock-api/search/search-response';
import {SearchObject} from './searchObject';

export type WordCorrectionData = {
  correctedWord: string;
  originalWord: string;
  length: number;
  offset: number;
};

export type DidYouMeanLegacyData = {
  correctedQuery: string;
  wordCorrections: WordCorrectionData[];
};

export type DidYouMeanNextData = {
  correctedQuery: string;
  wordCorrections: WordCorrectionData[];
  originalQuery: string;
};

export type QueryTriggerData = {
  type: string;
  content: string;
};

export class SearchObjectWithDidYouMeanOrTrigger extends SearchObject {
  constructor(page: Page, searchRequestRegex: RegExp) {
    super(page, searchRequestRegex);
  }

  /**
   * Routes the search endpoint so the first search returns the provided
   * override (built on the mocked base response) and every subsequent search
   * returns the plain base response. This mirrors the real flow (correction on
   * the first query, normal results on the follow-up).
   */
  private async mockSearchWithFirstResponseOverride(
    applyOverride: (body: Record<string, unknown>) => void
  ) {
    let overrideApplied = false;
    await this.page.unroute(this.searchRequestRegex);
    await this.page.route(this.searchRequestRegex, async (route) => {
      const body = {...searchResponses.richResponse} as Record<
        string,
        unknown
      >;
      if (!overrideApplied) {
        overrideApplied = true;
        applyOverride(body);
      }
      await route.fulfill({
        body: JSON.stringify(body),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }

  async mockSearchWithDidYouMeanLegacyResponse(
    didYouMeanDataObject: DidYouMeanLegacyData
  ) {
    await this.mockSearchWithFirstResponseOverride((body) => {
      body.queryCorrections = [didYouMeanDataObject];
      body.results = [];
      body.totalCount = 0;
      body.totalCountFiltered = 0;
    });
  }

  async mockSearchWithDidYouMeanNextResponse(
    didYouMeanNextDataObject: DidYouMeanNextData
  ) {
    await this.mockSearchWithFirstResponseOverride((body) => {
      body.queryCorrection = didYouMeanNextDataObject;
    });
  }

  async mockSearchWithQueryTriggerResponse(
    queryTriggerDataObject: QueryTriggerData
  ) {
    await this.mockSearchWithFirstResponseOverride((body) => {
      body.triggers = [queryTriggerDataObject];
    });
  }
}
