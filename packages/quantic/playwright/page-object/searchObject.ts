import {Page, Locator, Response} from '@playwright/test';
import {QuestionAnswerData} from '../../force-app/main/default/lwc/quanticSmartSnippetSuggestions/e2e/data';

export class SearchObject {
  constructor(
    private page: Page,
    private searchRequestRegex: RegExp
  ) {
    this.page = page;
    this.searchRequestRegex = searchRequestRegex;
  }

  get performSearchButton(): Locator {
    return this.page.locator('c-action-perform-search button');
  }

  async performSearch(): Promise<void> {
    await this.performSearchButton.click();
  }

  async waitForSearchResponse(): Promise<Response> {
    return this.page.waitForResponse(this.searchRequestRegex);
  }

  async interceptSearchIndefinitely(): Promise<() => void> {
    return new Promise((resolve) => {
      this.page.route(this.searchRequestRegex, async (route) => {
        resolve(() => route.continue());
      });
    });
  }

  async mockSearchWithGenerativeQuestionAnsweringId(streamId: string) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      originalBody.extendedResults = {
        generativeQuestionAnsweringId: streamId,
      };

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }

  async mockSearchWithSmartSnippetResponse(
    questionAnswerDataObject: QuestionAnswerData
  ) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      const [firstResult] = originalBody.results;
      firstResult.clickUri = '#';
      originalBody.questionAnswer = {
        ...questionAnswerDataObject,
        documentId: {
          ...questionAnswerDataObject.documentId,
          contentIdValue: firstResult.raw.permanentid,
        },
        relatedQuestions: [
          {
            ...questionAnswerDataObject.relatedQuestions?.[0],
            documentId: {
              ...questionAnswerDataObject.documentId,
              contentIdValue: firstResult.raw.permanentid,
            },
          },
          {
            ...questionAnswerDataObject.relatedQuestions?.[1],
            documentId: {
              ...questionAnswerDataObject.documentId,
              contentIdValue: firstResult.raw.permanentid,
            },
          },
        ],
      };

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }
}
