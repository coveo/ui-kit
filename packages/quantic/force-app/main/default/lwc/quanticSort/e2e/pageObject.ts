import type {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class SortObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get sortDropDown(): Locator {
    return this.page.getByRole('combobox', {name: 'Sort by'});
  }

  get sortPreviewButton(): Locator {
    return this.page.getByRole('button', {name: 'Preview'});
  }

  sortButton(buttonName: string): Locator {
    return this.page.getByRole('option', {name: buttonName});
  }

  async clickSortDropDown(): Promise<void> {
    await this.sortDropDown.click();
  }

  async focusSortDropDown(): Promise<void> {
    await this.sortPreviewButton.click();
    await this.page.keyboard.press('Tab');
  }

  async clickSortButton(buttonName: string): Promise<void> {
    await this.sortButton(buttonName).click();
  }

  async openSortDropdownUsingEnter(useEnter = true): Promise<void> {
    if (useEnter) {
      await this.page.keyboard.press('Enter');
    } else {
      await this.page.keyboard.press('Space');
    }
  }

  async selectSortOptionUsingArrow(): Promise<void> {
    await this.sortButton('Oldest').isVisible();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
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
