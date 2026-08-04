import {DocumentSuggestionObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {CaseAssistObject} from '../../../../../../playwright/page-object/caseAssistObject';

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
  options: {},
  urlHash: '',
  caseAssist: async ({page}, use) => {
    await use(new CaseAssistObject(page));
  },
  documentSuggestion: async ({page, options, configuration}, use) => {
    const documentSuggestionObject = new DocumentSuggestionObject(page);
    await documentSuggestionObject.mockCaseAssistConfigurations();
    await documentSuggestionObject.mockDocumentSuggestions();
    await page.goto(pageUrl);
    await configuration.configure(options);
    await use(documentSuggestionObject);
  },
});

export {expect} from '@playwright/test';
