import {Page} from '@playwright/test';
import {SearchObject} from './searchObject';

export type QuestionAnswerData = {
  answerFound: boolean;
  question: string;
  answerSnippet: string;
  documentId: {
    contentIdKey: string;
    contentIdValue: string;
  };
  score: number;
};

export type RelatedQuestions = {
  question: string;
  answerSnippet: string;
  documentId: {
    contentIdKey: string;
    contentIdValue: string;
  };
};

export type RelatedQuestionsData = {
  relatedQuestions: RelatedQuestions[];
};

export class SearchObjectWithSmartSnippet extends SearchObject {
  constructor(page: Page, searchRequestRegex: RegExp) {
    super(page, searchRequestRegex);
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

  async mockSearchWithSmartSnippetSuggestionsResponse(
    relatedQuestionsDataObject: RelatedQuestionsData
  ) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      const [firstResult] = originalBody.results;
      firstResult.clickUri = '#';
      originalBody.questionAnswer = {
        ...relatedQuestionsDataObject,
        relatedQuestions: [
          {
            ...relatedQuestionsDataObject.relatedQuestions?.[0],
            documentId: {
              ...relatedQuestionsDataObject.relatedQuestions?.[0].documentId,
              contentIdValue: firstResult.raw.permanentid,
            },
          },
          {
            ...relatedQuestionsDataObject.relatedQuestions?.[1],
            documentId: {
              ...relatedQuestionsDataObject.relatedQuestions?.[1].documentId,
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
