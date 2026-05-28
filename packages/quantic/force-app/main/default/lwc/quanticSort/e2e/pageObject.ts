import {expect, type Locator, type Page, type Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class SortObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get sortDropDown(): Locator {
    return this.page.getByRole('combobox', {name: 'Sort by'});
  }

  sortButton(buttonName: string): Locator {
    return this.page.getByRole('option', {name: buttonName});
  }

  async clickSortDropDown(): Promise<void> {
    await this.sortDropDown.click();
  }

  async focusSortDropDown(): Promise<void> {
    await this.sortDropDown.focus();
  }

  async clickSortButton(buttonName: string): Promise<void> {
    await this.sortButton(buttonName).click();
  }

  async openSortDropdownUsingKeyboardEnter(useEnter = true): Promise<void> {
    if (useEnter) {
      await this.sortDropDown.press('Enter');
    } else {
      await this.sortDropDown.press('Space');
    }
    const overlay = this.page.locator('div[part="dropdown overlay"]');
    await overlay.waitFor({state: 'visible'});
    await overlay
      .locator('[role="option"]')
      .first()
      .waitFor({state: 'visible'});
  }

  async selectNextSortOptionUsingKeyboard(
    expectedLabel: string
  ): Promise<void> {
    await this.sortDropDown.press('ArrowDown');
    await this.sortDropDown.press('Enter');
    await expect(this.sortDropDown).toHaveText(expectedLabel);
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

  async getSortLabelValue(): Promise<{label: string; value: string | null}[]> {
    const sortOptions = this.page.locator(
      'div[part="dropdown overlay"] [role="option"]'
    );
    await sortOptions.first().waitFor({state: 'visible'});

    return sortOptions.evaluateAll((options) =>
      options.map((option) => ({
        label: (
          (option as HTMLElement).innerText ||
          option.getAttribute('aria-label') ||
          option.getAttribute('title') ||
          ''
        ).trim(),
        value: option.getAttribute('data-value'),
      }))
    );
  }
}
