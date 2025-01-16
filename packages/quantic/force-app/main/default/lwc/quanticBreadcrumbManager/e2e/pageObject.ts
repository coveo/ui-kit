import type {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

const breadcrumbElementsSelectors = {
  regularFacet: {
    component: 'c-quantic-facet',
    facetValueComponent: 'c-quantic-facet-value',
    breadcrumbElementTestId: 'facet-breadcrumb',
    breadcrumbValueElementTestId: 'facet-breadcrumb-value',
  },
  numericFacet: {
    component: 'c-quantic-numeric-facet',
    facetValueComponent: 'c-quantic-facet-value',
    breadcrumbElementTestId: 'numeric-facet-breadcrumb',
    breadcrumbValueElementTestId: 'numeric-facet-breadcrumb-value',
  },
  categoryFacet: {
    component: 'c-quantic-category-facet',
    facetValueComponent: 'c-quantic-category-facet-value',
    breadcrumbElementTestId: 'category-facet-breadcrumb',
    breadcrumbValueElementTestId: 'category-facet-breadcrumb-value',
  },
  timeframeFacet: {
    component: 'c-quantic-timeframe-facet',
    facetValueComponent: 'c-quantic-facet-value',
    breadcrumbElementTestId: 'date-facet-breadcrumb',
    breadcrumbValueElementTestId: 'date-facet-breadcrumb-value',
  },
};

export class BreadcrumbManagerObject {
  constructor(public page: Page) {
    this.page = page;
  }

  async countAllFacetsBreadcrumb() {
    return (
      (await this.allRegularFacetBreadcrumb.count()) +
      (await this.allNumericFacetBreadcrumb.count()) +
      (await this.allCategoryFacetBreadcrumb.count()) +
      (await this.allTimeframeFacetBreadcrumb.count())
    );
  }

  /** REGULAR FACET */
  get allRegularFacetBreadcrumb(): Locator {
    return this.page.getByTestId(
      breadcrumbElementsSelectors.regularFacet.breadcrumbElementTestId
    );
  }

  get firstRegularFacetBreadcrumb(): Locator {
    return this.page
      .getByTestId(
        breadcrumbElementsSelectors.regularFacet.breadcrumbElementTestId
      )
      .first();
  }

  async clickFirstRegularFacetBreadcrumbValue(): Promise<void> {
    await this.firstRegularFacetBreadcrumb
      .getByTestId(
        breadcrumbElementsSelectors.regularFacet.breadcrumbValueElementTestId
      )
      .click();
  }

  get firstRegularFacet(): Locator {
    return this.page
      .locator(breadcrumbElementsSelectors.regularFacet.component)
      .first();
  }

  get firstRegularFacetValue(): Promise<string | null> {
    return this.firstRegularFacet
      .locator(breadcrumbElementsSelectors.regularFacet.facetValueComponent)
      .first()
      .locator('.facet__value-text')
      .textContent();
  }

  async clickFirstRegularFacetLink(): Promise<void> {
    await this.clickFirstFacetLink(this.firstRegularFacet);
  }

  async clickFirstFacetLink(facetLocator: Locator): Promise<void> {
    await facetLocator
      .locator(breadcrumbElementsSelectors.regularFacet.facetValueComponent)
      .first()
      .click();
  }

  /** NUMERIC FACET */
  get allNumericFacetBreadcrumb(): Locator {
    return this.page.getByTestId(
      breadcrumbElementsSelectors.numericFacet.breadcrumbElementTestId
    );
  }

  get firstNumericFacetBreadcrumb(): Locator {
    return this.page
      .getByTestId(
        breadcrumbElementsSelectors.numericFacet.breadcrumbElementTestId
      )
      .first();
  }

  async clickFirstNumericFacetBreadcrumbValue(): Promise<void> {
    await this.firstNumericFacetBreadcrumb
      .getByTestId(
        breadcrumbElementsSelectors.numericFacet.breadcrumbValueElementTestId
      )
      .click();
  }

  get firstNumericFacet(): Locator {
    return this.page
      .locator(breadcrumbElementsSelectors.numericFacet.component)
      .first();
  }

  get firstNumericFacetValue(): Promise<string | null> {
    return this.firstNumericFacet
      .locator(breadcrumbElementsSelectors.numericFacet.facetValueComponent)
      .first()
      .locator('.facet__value-text')
      .textContent();
  }

  async clickFirstNumericFacetLink(): Promise<void> {
    await this.clickFirstFacetLink(this.firstNumericFacet);
  }

  /** DATE|TIMEFRAME FACET */
  get allTimeframeFacetBreadcrumb(): Locator {
    return this.page.getByTestId(
      breadcrumbElementsSelectors.timeframeFacet.breadcrumbElementTestId
    );
  }

  get firstTimeframeFacetBreadcrumb(): Locator {
    return this.page
      .getByTestId(
        breadcrumbElementsSelectors.timeframeFacet.breadcrumbElementTestId
      )
      .first();
  }

  async clickFirstTimeframeFacetBreadcrumbValue(): Promise<void> {
    await this.firstTimeframeFacetBreadcrumb
      .getByTestId(
        breadcrumbElementsSelectors.timeframeFacet.breadcrumbValueElementTestId
      )
      .click();
  }

  get firstTimeframeFacet(): Locator {
    return this.page
      .locator(breadcrumbElementsSelectors.timeframeFacet.component)
      .first();
  }

  get firstTimeframeFacetValue(): Promise<string | null> {
    return this.firstTimeframeFacet
      .locator(breadcrumbElementsSelectors.timeframeFacet.facetValueComponent)
      .first()
      .locator('.facet__value-text')
      .textContent();
  }

  async clickFirstTimeframeFacetLink(): Promise<void> {
    await this.clickFirstFacetLink(this.firstTimeframeFacet);
  }

  /** CATEGORY FACET */
  get allCategoryFacetBreadcrumb(): Locator {
    return this.page.getByTestId(
      breadcrumbElementsSelectors.categoryFacet.breadcrumbElementTestId
    );
  }

  get firstCategoryFacetBreadcrumb(): Locator {
    return this.page
      .getByTestId(
        breadcrumbElementsSelectors.categoryFacet.breadcrumbElementTestId
      )
      .first();
  }

  async clickFirstCategoryFacetBreadcrumbValue(): Promise<void> {
    await this.firstCategoryFacetBreadcrumb
      .getByTestId(
        breadcrumbElementsSelectors.categoryFacet.breadcrumbValueElementTestId
      )
      .click();
  }

  get firstCategoryFacet(): Locator {
    return this.page
      .locator(breadcrumbElementsSelectors.categoryFacet.component)
      .first();
  }

  get firstCategoryFacetValue(): Promise<string | null> {
    return this.firstCategoryFacet
      .locator(breadcrumbElementsSelectors.categoryFacet.facetValueComponent)
      .first()
      .locator('.facet__value-option')
      .locator('span:not(.facet__number-of-results)')
      .textContent();
  }

  async clickFirstCategoryFacetLink(): Promise<void> {
    await this.clickFirstCategoryFacetValue(this.firstCategoryFacet);
  }

  async clickFirstCategoryFacetValue(facetLocator: Locator): Promise<void> {
    await facetLocator
      .locator(breadcrumbElementsSelectors.categoryFacet.facetValueComponent)
      .first()
      .click();
  }

  get clearAllButton(): Locator {
    return this.page.getByRole('button', {name: /Clear All Filters/i});
  }

  async clickClearAllButton(): Promise<void> {
    await this.clearAllButton.click();
  }

  async waitForBreadcrumbSearchUaAnalytics(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields = {
          actionCause: actionCause,
        };
        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        return (
          matchesExpectedFields &&
          (customChecker ? customChecker(customData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForBreadcrumbFacetUaAnalytics(
    expectedCustomFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForBreadcrumbSearchUaAnalytics(
      'breadcrumbFacet',
      (customData: Record<string, any>) => {
        return Object.keys(expectedCustomFields).every((key) =>
          typeof expectedCustomFields[key] === 'object'
            ? JSON.stringify(customData?.[key]) ===
              JSON.stringify(expectedCustomFields[key])
            : customData?.[key] === expectedCustomFields[key]
        );
      }
    );
  }

  async waitForBreadcrumbResetAllUaAnalytics(
    customChecker?: Function
  ): Promise<Request> {
    return this.waitForBreadcrumbSearchUaAnalytics(
      'breadcrumbResetAll',
      customChecker
    );
  }
}
