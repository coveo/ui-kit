import {Page} from '@playwright/test';
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

  async mockSearchWithDidYouMeanLegacyResponse(
    didYouMeanDataObject: DidYouMeanLegacyData
  ) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();

      originalBody.queryCorrections = [didYouMeanDataObject];
      originalBody.results = [];
      originalBody.totalCount = 0;
      originalBody.totalCountFiltered = 0;

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
      this.page.unroute(this.searchRequestRegex);
    });
  }

  async mockSearchWithDidYouMeanNextResponse(
    didYouMeanNextDataObject: DidYouMeanNextData
  ) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();

      originalBody.queryCorrection = didYouMeanNextDataObject;

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
      this.page.unroute(this.searchRequestRegex);
    });
  }

  async mockSearchWithQueryTriggerResponse(
    queryTriggerDataObject: QueryTriggerData
  ) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      originalBody.triggers = [queryTriggerDataObject];

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
      this.page.unroute(this.searchRequestRegex);
    });
  }
}
