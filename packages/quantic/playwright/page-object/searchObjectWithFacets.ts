import {Page, Response} from '@playwright/test';
import {SearchObject} from './searchObject';
import {facetRequestRegex} from '../utils/requests';

export class SearchObjectWithFacet extends SearchObject {
  constructor(page: Page, searchRequestRegex: RegExp) {
    super(page, searchRequestRegex);
  }

  async waitForFacetSearchResponse(): Promise<Response> {
    return this.page.waitForResponse(facetRequestRegex);
  }

  async mockSearchWithFacetResponse(facetData: Array<Record<string, unknown>>) {
    this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();

      originalBody.facets = facetData;
      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });

      await this.page.unroute(this.searchRequestRegex);
    });
  }
}
