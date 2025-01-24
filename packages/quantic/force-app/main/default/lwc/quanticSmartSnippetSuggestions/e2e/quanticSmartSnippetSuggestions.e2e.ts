import {testSearch, testInsight} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic smart snippet suggestions ${useCase.label}`, () => {
    test.describe('when expanding and collapsing the smart snippet suggestions', () => {
      test('should send the expand and collapse analytics events', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsHeadingClickPromise =
          smartSnippetSuggestions.waitForExpandSmartSnippetSuggestionUaAnalytics();

        await smartSnippetSuggestions.clickOnFirstSmartSnippetSuggestionHeading();
        await smartSnippetSuggestionsHeadingClickPromise;

        const smartSnippetSuggestionsCollapseClickPromise =
          smartSnippetSuggestions.waitForCollapseSmartSnippetSuggestionUaAnalytics();

        await smartSnippetSuggestions.clickOnFirstSmartSnippetSuggestionHeading();
        await smartSnippetSuggestionsCollapseClickPromise;
      });
    });

    test.describe('when interacting with a suggestion', () => {
      test.beforeEach(async ({smartSnippetSuggestions}) => {
        await smartSnippetSuggestions.clickOnFirstSmartSnippetSuggestionHeading();
      });

      test('should send the source title analytics event when the title is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsTitleClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionSourceClickUaAnalytics();

        await smartSnippetSuggestions.clickOnFirstSmartSnippetSuggestionSourceTitle();
        await smartSnippetSuggestionsTitleClickPromise;
      });

      test('should send the source uri analytics event when the uri is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsSourceUriClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionSourceClickUaAnalytics();

        await smartSnippetSuggestions.clickOnFirstSmartSnippetSuggestionSourceUri();
        await smartSnippetSuggestionsSourceUriClickPromise;
      });

      test('should send the inline link analytics event when an inline link is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsInlineLinkClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionInlineLinkClickUaAnalytics();

        await smartSnippetSuggestions.clickOnFirstSmartSnippetSuggestionInlineLink();
        await smartSnippetSuggestionsInlineLinkClickPromise;
      });
    });
  });
});
