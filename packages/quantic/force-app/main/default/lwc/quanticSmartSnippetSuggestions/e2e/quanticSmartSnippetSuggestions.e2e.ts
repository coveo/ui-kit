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
        const expandSmartSnippetSuggestionsPromise =
          smartSnippetSuggestions.waitForExpandSmartSnippetSuggestionUaAnalytics();

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionHeadingByIndex(
          0
        );
        await expandSmartSnippetSuggestionsPromise;

        const collapseSmartSnippetSuggestionsPromise =
          smartSnippetSuggestions.waitForCollapseSmartSnippetSuggestionUaAnalytics();

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionHeadingByIndex(
          0
        );
        await collapseSmartSnippetSuggestionsPromise;
      });
    });

    test.describe('when clicking on elements of the smart snippet suggestion', () => {
      test.beforeEach(async ({smartSnippetSuggestions}) => {
        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionHeadingByIndex(
          0
        );
      });

      test('should send the source title analytics event when the title is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsTitleClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionSourceClickUaAnalytics();

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionSourceTitleByIndex(
          0
        );
        await smartSnippetSuggestionsTitleClickPromise;
      });

      test('should send the source uri analytics event when the uri is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsSourceUriClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionSourceClickUaAnalytics();

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionSourceUriByIndex(
          0
        );
        await smartSnippetSuggestionsSourceUriClickPromise;
      });

      test('should send the inline link analytics event when an inline link is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionsInlineLinkClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionInlineLinkClickUaAnalytics();

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionInlineLinkByIndex(
          0
        );
        await smartSnippetSuggestionsInlineLinkClickPromise;
      });
    });
  });
});
