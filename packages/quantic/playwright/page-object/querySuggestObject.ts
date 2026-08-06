import {Page, Request, Response} from '@playwright/test';
import {querySuggestResponses} from '@coveo/platform-mock-api/search';

export class QuerySuggestObject {
  constructor(
    protected page: Page,
    protected querySuggestRequestRegex: RegExp
  ) {
    this.page = page;
    this.querySuggestRequestRegex = querySuggestRequestRegex;
  }

  async setRecentQueries(queries: string[]): Promise<void> {
    await this.page
      .getByTestId('localstorage-input')
      .locator('input')
      .fill(JSON.stringify(queries));
    await this.page.getByTestId('localstorage-set-button').click();
  }

  async getRecentQueriesFromLocalStorage(): Promise<string[]> {
    await this.page.getByTestId('localstorage-input').locator('input').fill('');
    await this.page.getByTestId('localstorage-get-button').click();
    const content = await this.page
      .getByTestId('localstorage-output')
      .textContent();
    return content ? JSON.parse(content) : [];
  }

  async waitForQuerySuggestRequest(): Promise<Request> {
    return this.page.waitForRequest(this.querySuggestRequestRegex);
  }

  async waitForQuerySuggestResponse(): Promise<Response> {
    return this.page.waitForResponse(this.querySuggestRequestRegex);
  }

  async mockQuerySuggestResponse(suggestions: string[]) {
    await this.page.route(this.querySuggestRequestRegex, async (route) => {
      const modifiedBody = {
        ...querySuggestResponses.baseResponse,
        completions: suggestions.map((suggestion) => ({
          expression: suggestion,
          highlighted: `[${suggestion}]`,
          executableConfidence: 1,
          objectId: `suggestion-${suggestion}`,
          score: 42,
        })),
      };
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(modifiedBody),
      });
    });
  }
}
