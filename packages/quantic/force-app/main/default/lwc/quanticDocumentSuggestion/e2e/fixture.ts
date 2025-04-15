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
      // Capture sendBeacon calls (ping) sent by EP. This must be done before the page.goto method.
      await page.addInitScript(() => {
        const originalSendBeacon = navigator.sendBeacon;
        window.__beaconData = [];
        navigator.sendBeacon = (url, data) => {
          if (data instanceof Blob) {
            const blob = data as Blob;
            blob.text().then((text) => {
              window.__beaconData.push({url, text});
            });
          } else {
            window.__beaconData.push({url, data});
          }
          return originalSendBeacon.call(navigator, url, data);
        };
      });

      await page.goto(pageUrl);
      await configuration.configure(options);
      await use(new DocumentSuggestionObject(page));
    },
  });

export {expect} from '@playwright/test';
