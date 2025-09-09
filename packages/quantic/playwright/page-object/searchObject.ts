import {Page, Locator, Response, Request} from '@playwright/test';

const selectors = {
  searchResults: 'c-quantic-result',
  performSearchButton: 'c-action-perform-search button',
  performSearchInput: 'c-action-perform-search input',
  performRecommendationSearchButton: 'c-action-get-recommendations button',
};

export class SearchObject {
  constructor(
    protected page: Page,
    protected searchRequestRegex: RegExp
  ) {
    this.page = page;
    this.searchRequestRegex = searchRequestRegex;
  }

  get performSearchButton(): Locator {
    return this.page.locator(selectors.performSearchButton);
  }

  get searchInput(): Locator {
    return this.page.locator(selectors.performSearchInput);
  }

  async fillSearchInput(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async performSearch(): Promise<void> {
    await this.performSearchButton.click();
  }

  async triggerSearchWithInput(query: string): Promise<void> {
    await this.fillSearchInput(query);
    await this.performSearch();
  }

  async waitForSearchResponse(): Promise<Response> {
    return this.page.waitForResponse(this.searchRequestRegex);
  }

  async waitForSearchResultsVisible(): Promise<void> {
    await this.page.waitForSelector(selectors.searchResults, {
      state: 'visible',
    });
  }

  async waitForSearchRequest(): Promise<Request> {
    return this.page.waitForRequest(this.searchRequestRegex);
  }

  get performRecommendationSearchButton(): Locator {
    return this.page.locator(selectors.performRecommendationSearchButton);
  }

  async performRecommendationSearch(): Promise<void> {
    await this.performRecommendationSearchButton.click();
  }

  async interceptSearchIndefinitely(): Promise<() => void> {
    return new Promise((resolve) => {
      this.page.route(this.searchRequestRegex, async (route) => {
        resolve(() => route.continue());
      });
    });
  }

  async mockSearchWithGenerativeQuestionAnsweringId(streamId: string) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      originalBody.extendedResults = {
        generativeQuestionAnsweringId: streamId,
      };

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }

  async mockSearchFacetOrder(facetIds: string[]): Promise<void> {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      const facets = originalBody.facets;
      const reorderedFacets: unknown[] = [];

      facetIds.forEach((facetId, idx) => {
        const facet = facets.find(
          (f: {facetId: string}) => f.facetId === facetId
        );
        if (facet) {
          reorderedFacets.push({
            ...facet,
            indexScore: 1 - idx * 0.01,
          });
        }
      });

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          ...originalBody,
          facets: reorderedFacets,
        }),
        headers: {
          ...route.request().headers(),
          'Content-Type': 'application/json',
        },
      });
    });
  }

  async mockEmptySearchResponse() {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
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
    });
  }

  extractDataFromResponse(response: Response) {
    return response.request().postDataJSON();
  }
}
