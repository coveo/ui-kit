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

  getFacetManagerItemByIndex(index: number): Locator {
    return this.facetManagerItems.nth(index);
  }

  /**
   * Filters out the date_input facets because they are not displayed in the facet manager.
   */
  filterInputFacets(facets: any): string[] {
    return facets
      .map((facet: any) => facet.facetId)
      .filter((id: string) => !/_input$/.test(id));
  }

  async mockFacetOrder(facetIds: string[], useCase: string): Promise<void> {
    const searchRequestRegexToUse =
      useCase === 'insight' ? insightSearchRequestRegex : searchRequestRegex;

    await this.page.route(searchRequestRegexToUse, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      const facets = originalBody.facets;
      const reorderedFacets: unknown[] = [];

      facetIds.forEach((facetId, idx) => {
        const facet = facets.find((f: any) => f.facetId === facetId);
        if (facet) {
          reorderedFacets.push({
            ...facet,
            indexScore: 1 - idx * 0.01,
          });
        }
      });

      await route.continue({
        method: 'POST',
        postData: JSON.stringify({
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
}
