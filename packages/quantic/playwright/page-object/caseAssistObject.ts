import {Page, Locator, Response, Route} from '@playwright/test';
import {
  caseAssistConfigurationsRequestRegex,
  classifyRequestRegex,
  documentsSuggestRequestRegex,
} from '../utils/requests';

const maxConfigurationAttempts = 3;

/**
 * The longest the Case Assist configurations lookup can take, retries
 * included. Each attempt gets the time left, so only quick failures are
 * retried. The fixtures derive their readiness timeouts from it.
 */
export const caseAssistConfigurationsTimeoutMs = 10_000;

/**
 * The Case Assist configurations returned by the Coveo platform, shared by the
 * tests of a worker so that only the first one calls the live endpoint.
 */
let caseAssistConfigurations: Promise<unknown> | undefined;

async function fetchCaseAssistConfigurations(route: Route): Promise<unknown> {
  const deadline = Date.now() + caseAssistConfigurationsTimeoutMs;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxConfigurationAttempts; attempt++) {
    const timeout = deadline - Date.now();
    if (timeout <= 0) {
      break;
    }
    try {
      const response = await route.fetch({timeout});
      if (response.ok()) {
        return await response.json();
      }
      lastError = new Error(`HTTP ${response.status()}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export class CaseAssistObject {
  constructor(private page: Page) {
    this.page = page;
  }

  get fetchSuggestionsButton(): Locator {
    return this.page.getByRole('button', {name: 'Fetch suggestions'});
  }

  get fetchClassificationsButton(): Locator {
    return this.page.locator('c-action-fetch-classifications button');
  }

  async fetchClassifications(): Promise<void> {
    await this.fetchClassificationsButton.click();
  }

  async fetchSuggestions(): Promise<void> {
    await this.fetchSuggestionsButton.click();
  }

  async waitForCaseClassificationsResponse(): Promise<Response> {
    return this.page.waitForResponse(classifyRequestRegex);
  }

  async waitForDocumentSuggestionResponse(): Promise<Response> {
    return this.page.waitForResponse(documentsSuggestRequestRegex);
  }

  /**
   * The example pages look up their Case Assist ID with a live call to the
   * Coveo platform before showing the component, and show nothing when that
   * call fails. Serve that lookup from a cache, with retries on the first call.
   */
  async mockCaseAssistConfigurations(): Promise<void> {
    await this.page.route(
      caseAssistConfigurationsRequestRegex,
      async (route) => {
        let configurations: unknown;
        try {
          caseAssistConfigurations ??= fetchCaseAssistConfigurations(route);
          configurations = await caseAssistConfigurations;
        } catch {
          caseAssistConfigurations = undefined;
          await route.continue();
          return;
        }
        await route.fulfill({json: configurations});
      }
    );
  }
}
