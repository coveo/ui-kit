import {CaseClassificationObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {CaseAssistObject} from '../../../../../../playwright/page-object/caseAssistObject';
import {
  allOptions,
  caseClassificationSuggestions,
  coveoDefaultField,
  sfDefaultField,
} from './data';

type AnalyticsMode = 'ua' | 'ep';

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
};

export const test = quanticBase.extend<
  QuanticCaseClassificationE2EFixtures & {
    analyticsMode: AnalyticsMode;
  }
>({
  options: {},
  analyticsMode: ['ua', {option: true}],
  caseAssist: async ({page}, use) => {
    await use(new CaseAssistObject(page));
  },
  caseClassification: async (
    {page, options, configuration, caseAssist, analyticsMode},
    use
  ) => {
    const caseClassificationObject = new CaseClassificationObject(
      page,
      analyticsMode
    );
    caseClassificationObject.mockSfPicklistValues(sfDefaultField, allOptions);
    caseClassificationObject.mockCaseClassification(
      coveoDefaultField,
      caseClassificationSuggestions
    );
    await page.goto(pageUrl);
    await configuration.configure({...options});
    await caseClassificationObject.allOptionsSelectInput.waitFor();

    const caseClassificationsResponsePromise =
      caseAssist.waitForCaseClassificationsResponse();
    await caseAssist.fetchClassifications();
    await caseClassificationsResponsePromise;
    await use(caseClassificationObject);
  },
});

export {expect} from '@playwright/test';
