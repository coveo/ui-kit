import {testSearch, testInsight} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import smartSnippetSuggestionsData from './data';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic smart snippet suggestions ${useCase.label}`, () => {
    test.use({
      smartSnippetSuggestionsData,
    });
    test.describe('when expanding and collapsing the smart snippet suggestions', () => {
      test('should send the expand and collapse analytics events', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionIndex = 0;
        const {question, answerSnippet} =
          smartSnippetSuggestionsData.relatedQuestions[
            smartSnippetSuggestionIndex
          ];
        const expandSmartSnippetSuggestionsPromise =
          smartSnippetSuggestions.waitForExpandSmartSnippetSuggestionUaAnalytics(
            {
              question,
              answerSnippet,
            }
          );

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionHeading(
          smartSnippetSuggestionIndex
        );
        await expandSmartSnippetSuggestionsPromise;

        const collapseSmartSnippetSuggestionsPromise =
          smartSnippetSuggestions.waitForCollapseSmartSnippetSuggestionUaAnalytics(
            {
              question,
              answerSnippet,
            }
          );

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionHeading(
          smartSnippetSuggestionIndex
        );
        await collapseSmartSnippetSuggestionsPromise;
      });
    });

    test.describe('when clicking on elements of the smart snippet suggestion', () => {
      test.beforeEach(async ({smartSnippetSuggestions}) => {
        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionHeading(0);
      });

      test('should send the source title analytics event when the title is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionIndex = 0;
        const {question, answerSnippet} =
          smartSnippetSuggestionsData.relatedQuestions[
            smartSnippetSuggestionIndex
          ];
        const smartSnippetSuggestionsTitleClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionSourceClickUaAnalytics(
            {
              question,
              answerSnippet,
            }
          );

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionSourceTitle(
          smartSnippetSuggestionIndex
        );
        await smartSnippetSuggestionsTitleClickPromise;
      });

      test('should send the source uri analytics event when the uri is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionIndex = 0;
        const {question, answerSnippet} =
          smartSnippetSuggestionsData.relatedQuestions[
            smartSnippetSuggestionIndex
          ];

        const smartSnippetSuggestionsSourceUriClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionSourceClickUaAnalytics(
            {
              question,
              answerSnippet,
            }
          );

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionSourceUri(
          smartSnippetSuggestionIndex
        );
        await smartSnippetSuggestionsSourceUriClickPromise;
      });

      test('should send the inline link analytics event when an inline link is clicked', async ({
        smartSnippetSuggestions,
      }) => {
        const smartSnippetSuggestionIndex = 0;
        const {question, answerSnippet} =
          smartSnippetSuggestionsData.relatedQuestions[
            smartSnippetSuggestionIndex
          ];
        const smartSnippetSuggestionsInlineLinkClickPromise =
          smartSnippetSuggestions.waitForSmartSnippetSuggestionInlineLinkClickUaAnalytics(
            {
              question,
              answerSnippet,
            }
          );

        await smartSnippetSuggestions.clickOnSmartSnippetSuggestionInlineLink(
          smartSnippetSuggestionIndex
        );
        await smartSnippetSuggestionsInlineLinkClickPromise;
      });
    });
  });
});
