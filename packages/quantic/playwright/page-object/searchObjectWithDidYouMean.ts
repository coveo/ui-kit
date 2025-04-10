import {Page} from '@playwright/test';
import {SearchObject} from './searchObject';

export type WordCorrectionData = {
  correctedWord: string;
  originalWord: string;
  length: number;
  offset: number;
};

export type DidYouMeanData = {
  correctedQuery: string;
  wordCorrections: WordCorrectionData[];
};

export type QueryTriggerData = {
  type: string;
  content: string;
};

export class SearchObjectWithDidYouMeanOrTrigger extends SearchObject {
  constructor(page: Page, searchRequestRegex: RegExp) {
    super(page, searchRequestRegex);
  }

  async mockSearchWithDidYouMeanResponse(didYouMeanDataObject: DidYouMeanData) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();

      originalBody.queryCorrections = [didYouMeanDataObject];

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }

  async mockSearchWithQueryTriggerResponse(
    queryTriggerDataObject: QueryTriggerData
  ) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      originalBody.queryTriggers = [queryTriggerDataObject];

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }
}
