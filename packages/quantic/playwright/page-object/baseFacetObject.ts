import {Page, Response, Request} from '@playwright/test';
import {SearchObject} from './searchObject';
import {
  facetRequestRegex,
  isUaCustomEvent,
  isUaSearchEvent,
} from '../utils/requests';

export class BaseFacetObject extends SearchObject {
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

  async waitForFacetUaSearchEvent(
    actionCause: string,
    customChecker?: (obj: Record<string, unknown>) => boolean
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields: Record<string, unknown> = {
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

        const expectedFields: Record<string, unknown> = {
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
    expectedFields: Record<string, unknown>
  ): Promise<Request> {
    return this.waitForFacetUaSearchEvent(
      'facetSelect',
      (customData: Record<string, unknown>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForFacetDeselectUaAnalytics(
    expectedFields: Record<string, unknown>
  ): Promise<Request> {
    return this.waitForFacetUaSearchEvent(
      'facetDeselect',
      (customData: Record<string, unknown>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForFacetClearAllUaAnalytics(
    expectedFields: Record<string, unknown>
  ): Promise<Request> {
    return this.waitForFacetUaSearchEvent(
      'facetClearAll',
      (customData: Record<string, unknown>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForShowMoreFacetResultsUaAnalytics(
    expectedFields: Record<string, unknown>
  ): Promise<Request> {
    return this.waitForFacetUaCustomEvent(
      'showMoreFacetResults',
      (customData: Record<string, unknown>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForShowLessFacetResultsUaAnalytics(
    expectedFields: Record<string, unknown>
  ): Promise<Request> {
    return this.waitForFacetUaCustomEvent(
      'showLessFacetResults',
      (customData: Record<string, unknown>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }
}
