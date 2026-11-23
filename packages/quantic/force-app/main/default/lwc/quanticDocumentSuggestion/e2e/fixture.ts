import {expect} from '@playwright/test';
import {DocumentSuggestionObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  CaseAssistObject,
  fakeCaseAssistId,
} from '../../../../../../playwright/page-object/caseAssistObject';

const pageUrl = 's/quantic-document-suggestion';

interface DocumentSuggestionOptions {
  engineId: string;
  searchEngineId: string;
  maxDocuments: number;
  fetchOnInit: boolean;
  withoutQuickview: boolean;
  numberOfAutoOpenedDocuments: number;
}

type QuanticDocumentSuggestionE2EFixtures = {
  documentSuggestion: DocumentSuggestionObject;
  search: SearchObject;
  caseAssist: CaseAssistObject;
  options: Partial<DocumentSuggestionOptions>;
  urlHash: string;
};

export const test = quanticBase.extend<QuanticDocumentSuggestionE2EFixtures>({
  pageUrl: pageUrl,
  options: {},
  urlHash: '',
  caseAssist: async ({page}, use) => {
    await use(new CaseAssistObject(page));
  },
  documentSuggestion: async (
    {page, options, configuration, caseAssist, analytics},
    use
  ) => {
    await page.goto(pageUrl);
    await caseAssist.mockDocumentSuggestions();
    await configuration.configure({caseAssistId: fakeCaseAssistId, ...options});
    const documentSuggestion = new DocumentSuggestionObject(
      page,
      analytics.analyticsMode
    );
    await expect(documentSuggestion.noSuggestionsMessage).toBeVisible();
    await use(documentSuggestion);
  },
});

export {expect} from '@playwright/test';
