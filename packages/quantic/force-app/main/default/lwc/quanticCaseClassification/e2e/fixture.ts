import {CaseClassificationObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  CaseAssistObject,
  demoCaseAssistId,
  fakeCaseAssistId,
} from '../../../../../../playwright/page-object/caseAssistObject';
import {
  allOptions,
  caseClassificationSuggestions,
  coveoDefaultField,
  sfDefaultField,
} from './data';

const pageUrl = 's/quantic-case-classification';

interface CaseClassificationOptions {
  fetchOnInit: boolean;
  fetchClassificationOnChange: boolean;
  fetchDocumentSuggestionOnChange: boolean;
}
type QuanticCaseClassificationE2EFixtures = {
  caseClassification: CaseClassificationObject;
  caseAssist: CaseAssistObject;
  options: Partial<CaseClassificationOptions>;
  /**
   * Whether to call the live Case Assist API instead of mocking classify and
   * documents/suggest. When true, the fixture doesn't fetch classifications.
   */
  liveCaseAssistApi: boolean;
};

export const test = quanticBase.extend<QuanticCaseClassificationE2EFixtures>({
  options: {},
  liveCaseAssistApi: [false, {option: true}],
  caseAssist: async ({page}, use) => {
    await use(new CaseAssistObject(page));
  },
  caseClassification: async (
    {page, options, configuration, caseAssist, liveCaseAssistApi},
    use
  ) => {
    const caseClassificationObject = new CaseClassificationObject(page);
    await page.goto(pageUrl);
    await caseClassificationObject.mockSfPicklistValues(
      sfDefaultField,
      allOptions
    );
    if (liveCaseAssistApi) {
      // The interface logs the case start only once every component, the case classification included, is initialized with the engine.
      const caseStartCollectEventPromise =
        caseClassificationObject.waitForCaseStartCollectAnalytics();
      await configuration.configure({
        caseAssistId: demoCaseAssistId,
        ...options,
      });
      await caseClassificationObject.allOptionsSelectInput.waitFor();
      await caseStartCollectEventPromise;
      await use(caseClassificationObject);
      return;
    }

    await caseAssist.mockDocumentSuggestions();
    await caseClassificationObject.mockCaseClassification(
      coveoDefaultField,
      caseClassificationSuggestions
    );
    await configuration.configure({caseAssistId: fakeCaseAssistId, ...options});
    await caseClassificationObject.allOptionsSelectInput.waitFor();

    const caseClassificationsResponsePromise =
      caseAssist.waitForCaseClassificationsResponse();
    await caseAssist.fetchClassifications();
    await caseClassificationsResponsePromise;
    await use(caseClassificationObject);
  },
});

export {expect} from '@playwright/test';
