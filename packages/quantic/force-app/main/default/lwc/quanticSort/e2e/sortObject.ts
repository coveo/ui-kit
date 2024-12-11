import {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class SortObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get sortDropDown(): Locator {
    return this.page.getByRole('combobox', {name: 'Sort by'});
  }

  get sortPreviewHeader(): Locator {
    return this.page.getByRole('button', {name: 'Preview'});
  }

  get invalidMessage(): Locator {
    return this.page
      .locator('p')
      .filter({hasText: 'Custom sort options configuration is invalid.'});
  }

  sortButton(buttonName: string): Locator {
    return this.page.getByRole('option', {name: buttonName});
  }

  async clickSortDropDown(): Promise<void> {
    await this.sortDropDown.click();
  }

  async focusSortDropDownEnter(): Promise<void> {
    await this.sortPreviewHeader.click();
    await this.page.keyboard.press('Tab');
  }

  async clickSortButton(buttonName: string): Promise<void> {
    await this.sortButton(buttonName).click();
  }

  async selectSortButtonKeyboard(): Promise<void> {
    await this.page.keyboard.press('Enter');
    await this.sortButton('Oldest').isVisible();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
  }

  async invalidSortMessage(): Promise<void> {
    await this.invalidMessage.isVisible();
  }

  async waitForSortUaAnalytics(eventValue: any): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON();
        const expectedFields = {
          actionCause: 'resultsSort',
          customData: {
            resultsSortBy: eventValue,
          },
        };

        const validateObject = (obj: any, expectedResult: any): boolean =>
          Object.entries(expectedResult).every(([key, value]) =>
            value && typeof value === 'object'
              ? validateObject(obj?.[key], value)
              : obj?.[key] === value
          );

        return validateObject(requestBody, expectedFields);
      }
      return false;
    });
    return uaRequest;
  }
}
