import {CaseClassificationObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  CaseAssistObject,
  caseAssistConfigurationsTimeoutMs,
} from '../../../../../../playwright/page-object/caseAssistObject';
import {
  allOptions,
  caseClassificationSuggestions,
  coveoDefaultField,
  sfDefaultField,
} from './data';

const pageUrl = 's/quantic-case-classification';
const readinessTimeoutMs = caseAssistConfigurationsTimeoutMs + 5_000;

interface CaseClassificationOptions {
  fetchOnInit: boolean;
  fetchClassificationOnChange: boolean;
  fetchDocumentSuggestionOnChange: boolean;
}
type QuanticCaseClassificationE2EFixtures = {
  caseClassification: CaseClassificationObject;
  caseAssist: CaseAssistObject;
  options: Partial<CaseClassificationOptions>;
};

export const test = quanticBase.extend<QuanticCaseClassificationE2EFixtures>({
  options: {},
  caseAssist: async ({page}, use) => {
    await use(new CaseAssistObject(page));
  },
  caseClassification: async (
    {page, options, configuration, caseAssist},
    use
  ) => {
    const caseClassificationObject = new CaseClassificationObject(page);
    await page.goto(pageUrl);
    await caseAssist.mockCaseAssistConfigurations();
    await caseClassificationObject.mockSfPicklistValues(
      sfDefaultField,
      allOptions
    );
    await caseClassificationObject.mockCaseClassification(
      coveoDefaultField,
      caseClassificationSuggestions
    );
    await configuration.configure({...options});
    await caseClassificationObject.allOptionsSelectInput.waitFor({
      timeout: readinessTimeoutMs,
    });

    const caseClassificationsResponsePromise =
      caseAssist.waitForCaseClassificationsResponse();
    await caseAssist.fetchClassifications();
    await caseClassificationsResponsePromise;
    await use(caseClassificationObject);
  },
});

export {expect} from '@playwright/test';
