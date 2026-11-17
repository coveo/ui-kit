import {expect} from '@playwright/test';
import {DocumentSuggestionObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  CaseAssistObject,
  caseAssistConfigurationsTimeoutMs,
} from '../../../../../../playwright/page-object/caseAssistObject';

const pageUrl = 's/quantic-document-suggestion';
const readinessTimeoutMs = caseAssistConfigurationsTimeoutMs + 5_000;

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
    await caseAssist.mockCaseAssistConfigurations();
    await configuration.configure(options);
    const documentSuggestion = new DocumentSuggestionObject(
      page,
      analytics.analyticsMode
    );
    await expect(documentSuggestion.noSuggestionsMessage).toBeVisible({
      timeout: readinessTimeoutMs,
    });
    await use(documentSuggestion);
  },
});

export {expect} from '@playwright/test';
