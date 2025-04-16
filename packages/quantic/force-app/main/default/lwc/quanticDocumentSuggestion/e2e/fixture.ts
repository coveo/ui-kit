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
};

type QuanticDocumentSuggestionE2ESearchFixtures =
  QuanticDocumentSuggestionE2EFixtures & {
    urlHash: string;
  };

export const test =
  quanticBase.extend<QuanticDocumentSuggestionE2ESearchFixtures>({
    options: {},
    urlHash: '',
    caseAssist: async ({page}, use) => {
      await use(new CaseAssistObject(page));
    },
    documentSuggestion: async ({page, options, configuration}, use) => {
      await page.goto(pageUrl);
      await configuration.configure(options);
      await use(new DocumentSuggestionObject(page));
    },
  });

export {expect} from '@playwright/test';
