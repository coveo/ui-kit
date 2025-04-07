import type {Locator, Page, Request, Response} from '@playwright/test';
import {
  isUaCustomEvent,
  isUaSearchEvent,
} from '../../../../../../playwright/utils/requests';

export class FacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-facet');
  }

  get facetValue(): Locator {
    return this.facet.getByTestId('facet__value');
  }

  get facetValueInput(): Locator {
    return this.facet.getByRole('checkbox', {name: 'Facet value option'});
  }

  get showMoreFacetValuesButton(): Locator {
    return this.facet.getByTestId('facet-values__show-more');
  }

  get showLessFacetValuesButton(): Locator {
    return this.facet.getByTestId('facet-values__show-less');
  }

  get facetSearchBoxInput(): Locator {
    return this.facet.getByTestId('facet__searchbox-input').locator('input');
  }

  get facetBreadcrumb(): Locator {
    return this.page.getByTestId('facet-breadcrumb');
  }

  get clearSelectionButton(): Locator {
    return this.page.getByTestId('clear-selection-button');
  }

  facetBreadcrumbValue(index: number): Locator {
    return this.facetBreadcrumb.locator('c-quantic-pill').nth(index);
  }

  async clickOnFacetValue(index: number): Promise<void> {
    await this.facetValue.nth(index).click();
  }

  async clickOnshowMoreFacetValuesButton(): Promise<void> {
    await this.showMoreFacetValuesButton.click();
  }

  async clickOnshowLessFacetValuesButton(): Promise<void> {
    await this.showLessFacetValuesButton.click();
  }

  async fillFacetSearchBoxInput(query: string): Promise<void> {
    await this.facetSearchBoxInput.fill(query);
  }

  async clickOnClearSelectionButton(): Promise<void> {
    await this.clearSelectionButton.click();
  }

  async waitForFacetUaSearchEvent(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields: Record<string, any> = {
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

  async waitForFacetUaCustomEvent(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields: Record<string, any> = {
          eventValue: actionCause,
          eventType: 'facet',
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

  async waitForFacetSelectUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForFacetUaSearchEvent(
      'facetSelect',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForFacetDeselectUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForFacetUaSearchEvent(
      'facetDeselect',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForFacetClearAllUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForFacetUaSearchEvent(
      'facetClearAll',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForShowMoreFacetResultsUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForFacetUaCustomEvent(
      'showMoreFacetResults',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForShowLessFacetResultsUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForFacetUaCustomEvent(
      'showLessFacetResults',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  extractDataFromSearchResponse(response: Response) {
    return response.request().postDataJSON();
  }
}
