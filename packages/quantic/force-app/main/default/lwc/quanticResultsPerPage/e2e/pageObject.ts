import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

const resultsPerPageElementsSelectors = {
  component: 'c-quantic-results-per-page',
  componentError: 'c-quantic-component-error',
  resultsPerPageTestId: 'results-per-page',
  resultsPerPageOptionButton: 'c-quantic-number-button',
  selectedResultsPerPageOptionButton: 'button.slds-button_brand',
};

export class ResultsPerPageObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get component(): Locator {
    return this.page.getByTestId(
      resultsPerPageElementsSelectors.resultsPerPageTestId
    );
  }

  get allResultsPerPageOptionsButtons(): Locator {
    return this.component.locator(
      resultsPerPageElementsSelectors.resultsPerPageOptionButton
    );
  }

  get selectedResultsPerPageOption(): Locator {
    return this.allResultsPerPageOptionsButtons.filter({
      has: this.page.locator(
        resultsPerPageElementsSelectors.selectedResultsPerPageOptionButton
      ),
    });
  }

  getResultPerPageOptionByValue(value: number): Locator {
    return this.allResultsPerPageOptionsButtons.getByText(value.toString());
  }

  async clickResultsPerPageOptionByValue(value: number): Promise<void> {
    await this.getResultPerPageOptionByValue(value).click();
  }

  async waitForResultsPerPageClickUA(
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;

        const expectedFields = {
          eventType: 'getMoreResults',
          eventValue: 'pagerResize',
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

  async waitForResultsPerPageUA(
    expectedCustomFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForResultsPerPageClickUA(
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
}
