import type {Locator, Page, Request} from '@playwright/test';
import {isCollectEvent} from '../../../../../../playwright/utils/requests';

const elementsSelectors = {
  component: 'c-quantic-case-classification',
  caseClassificationSuggestionTestId: 'case-classification-suggestion',
  showSelectInputButtonTestId: 'show-select-input-button',
  allOptionsSelectInputTestId: 'case-classification-all-options-combobox',
  selectInputOption: 'lightning-base-combobox-item',
};

export class CaseClassificationObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get component(): Locator {
    return this.page.locator(elementsSelectors.component);
  }

  get caseClassificationSuggestions(): Locator {
    return this.component.locator(
      `[data-testid="${elementsSelectors.caseClassificationSuggestionTestId}"]:visible`
    );
  }

  get showSelectInputButton(): Locator {
    return this.component.getByTestId(
      elementsSelectors.showSelectInputButtonTestId
    );
  }

  get allOptionsSelectInput(): Locator {
    return this.component.getByTestId(
      elementsSelectors.allOptionsSelectInputTestId
    );
  }

  get allOptionsSelectInputValue(): Promise<null | string> {
    return this.allOptionsSelectInput.locator('button').textContent();
  }

  get selectInputOption(): Locator {
    return this.component.locator(elementsSelectors.selectInputOption);
  }

  get selectedSuggestion(): Locator {
    return this.component.locator(
      `[data-testid="${elementsSelectors.caseClassificationSuggestionTestId}"] > input:checked`
    );
  }

  async clickCaseClassificationSuggestionAtIndex(index: number): Promise<void> {
    await this.caseClassificationSuggestions.nth(index).click();
  }

  async clickShowSelectInputButton(): Promise<void> {
    await this.showSelectInputButton.click();
  }

  async clickallOptionsSelectInput(): Promise<void> {
    await this.allOptionsSelectInput.click();
  }

  async clickSelectInputOptionAtIndex(index: number): Promise<void> {
    await this.selectInputOption.nth(index).click();
  }

  async mockCaseClassification(
    field: string,
    value: Array<object>,
    responseId?: string
  ) {
    await this.page.route(
      '**/rest/organizations/*/caseassists/*/classify',
      async (route) => {
        await route.fulfill({
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              [field]: {predictions: value},
            },
            responseId: responseId ?? '123',
          }),
        });
      }
    );
  }

  async mockSfPicklistValues(field: string, values: Array<object>) {
    await this.page.route(
      '**/aura?*aura.RecordUi.getPicklistValuesByRecordType=1',
      async (route) => {
        const response = await route.fetch();
        const responseBody = await response.json();

        responseBody.actions[0].returnValue.picklistFieldValues[field].values =
          values.map((value) => ({
            ...value,
            attributes: null,
          }));

        await route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: JSON.stringify(responseBody),
        });
      }
    );
  }

  async waitForCollectAnalytics(
    expectedAction: string,
    expectedData: Record<string, any>
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isCollectEvent(request)) {
        const requestBody = request.postDataJSON?.();
        if (requestBody.svc_action !== expectedAction) {
          return false;
        }
        const dataMatches = Object.keys(expectedData).every(
          (key) =>
            JSON.stringify(requestBody.svc_action_data[key]) ===
            JSON.stringify(expectedData[key])
        );

        return dataMatches;
      }
      return false;
    });
    return uaRequest;
  }

  async waitForTicketClassificationClickCollectAnalytics(
    expectedData: Record<string, any>
  ): Promise<Request> {
    return this.waitForCollectAnalytics(
      'ticket_classification_click',
      expectedData
    );
  }

  async waitForTicketFieldUpdateCollectAnalytics(
    expectedData: Record<string, any>
  ): Promise<Request> {
    return this.waitForCollectAnalytics('ticket_field_update', expectedData);
  }
}
