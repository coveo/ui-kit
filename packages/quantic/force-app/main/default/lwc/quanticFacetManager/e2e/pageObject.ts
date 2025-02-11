import type {Locator, Page} from '@playwright/test';
import {
  insightSearchRequestRegex,
  searchRequestRegex,
} from '../../../../../../playwright/utils/requests';

export class FacetManagerObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facetManager(): Locator {
    return this.page.locator('c-quantic-facet-manager');
  }

  get facetManagerItems(): Locator {
    return this.facetManager.locator('.facet-manager__item');
  }

  async configureFacetOrder(
    isOrderReversed: boolean,
    useCase: string
  ): Promise<void> {
    const searchRequestRegexToUse =
      useCase === 'insight' ? insightSearchRequestRegex : searchRequestRegex;

    await this.page.route(searchRequestRegexToUse, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      originalBody.facets = isOrderReversed
        ? originalBody.facets.reverse()
        : originalBody.facets;

      await route.continue({
        method: 'POST',
        postData: JSON.stringify({
          ...originalBody,
          facets: originalBody.facets,
        }),
        headers: {
          ...route.request().headers(),
          'Content-Type': 'application/json',
        },
      });
    });
  }
}
