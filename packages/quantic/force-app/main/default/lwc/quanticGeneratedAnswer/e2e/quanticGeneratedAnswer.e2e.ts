import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import genQaData from './data';
import {analyticsModeTest} from '../../../../../../playwright/utils/analyticsMode';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic generated answer ${useCase.label}`, () => {
    test.use({
      genQaData,
    });

    analyticsModeTest.forEach((analytics) => {
      test.describe(analytics.label, () => {
        test.use({
          analyticsMode: analytics.mode,
        });

        test.describe('when the answer has been generated', () => {
          test('should send a stream end analytics event', async ({
            generatedAnswer,
          }) => {
            await generatedAnswer.waitForStreamEndAnalytics();
          });
        });

        test.describe('when providing positive feedback', () => {
          test('should send positive feedback analytics containing all details', async ({
            generatedAnswer,
          }) => {
            const likeAnalyticRequestPromise =
              generatedAnswer.waitForLikeGeneratedAnswerAnalytics();
            await generatedAnswer.clickLikeButton();
            await likeAnalyticRequestPromise;

            const exampleDocumentUrl = 'https://www.coveo.com/';
            const exampleDetails = 'example details...';
            await generatedAnswer.fillFeedbackForm({
              correctTopic: 'Yes',
              hallucinationFree: 'Yes',
              documented: 'Not sure',
              readable: 'Yes',
            });
            await generatedAnswer.typeInFeedbackDocumentUrlInput(
              exampleDocumentUrl
            );
            await generatedAnswer.typeInFeedbackDetailsInput(exampleDetails);

            const feedbackAnalyticRequestPromise =
              generatedAnswer.waitForFeedbackSubmitAnalytics({
                correctTopic: 'yes',
                hallucinationFree: 'yes',
                documented: 'unknown',
                readable: 'yes',
                documentUrl: exampleDocumentUrl,
                details: exampleDetails,
                helpful: true,
              });
            await generatedAnswer.clickSubmitFeedbackButton();
            await feedbackAnalyticRequestPromise;
          });
        });

        test.describe('when providing negative feedback', () => {
          test('should send negative feedback analytics containing all details', async ({
            generatedAnswer,
          }) => {
            const dislikeAnalyticRequestPromise =
              generatedAnswer.waitForDislikeGeneratedAnswerAnalytics();
            await generatedAnswer.clickDislikeButton();
            await dislikeAnalyticRequestPromise;

            const exampleDocumentUrl = 'https://www.coveo.com/';
            const exampleDetails = 'example details...';
            await generatedAnswer.fillFeedbackForm({
              correctTopic: 'No',
              hallucinationFree: 'Not sure',
              documented: 'No',
              readable: 'No',
            });
            await generatedAnswer.typeInFeedbackDocumentUrlInput(
              exampleDocumentUrl
            );
            await generatedAnswer.typeInFeedbackDetailsInput(exampleDetails);

            const feedbackAnalyticRequestPromise =
              generatedAnswer.waitForFeedbackSubmitAnalytics({
                correctTopic: 'no',
                hallucinationFree: 'unknown',
                documented: 'no',
                readable: 'no',
                documentUrl: exampleDocumentUrl,
                details: exampleDetails,
                helpful: false,
              });
            await generatedAnswer.clickSubmitFeedbackButton();
            await feedbackAnalyticRequestPromise;
          });
        });

        test.describe('when copying the generated answer to clipboard', () => {
          test('should send a copy to clipboard analytics event', async ({
            generatedAnswer,
          }) => {
            const analyticRequestPromise =
              generatedAnswer.waitForCopyToClipboardAnalytics();
            await generatedAnswer.clickCopyToClipboardButton();
            await analyticRequestPromise;
          });
        });

        test.describe('when the property withToggle is set to true', () => {
          test.use({
            options: {
              withToggle: true,
            },
          });

          test('should allow toggling the generated OFF and ON and log analytics', async ({
            generatedAnswer,
          }) => {
            const hideAnswerAnalyticRequestPromise =
              generatedAnswer.waitForHideAnswersAnalytics();
            await generatedAnswer.clickToggleButton();
            await hideAnswerAnalyticRequestPromise;

            const showAnswerAnalyticRequestPromise =
              generatedAnswer.waitForShowAnswersAnalytics();
            await generatedAnswer.clickToggleButton();
            await showAnswerAnalyticRequestPromise;
          });
        });

        test.describe('when interacting with citations', () => {
          test.describe('when hovering over a citation', () => {
            test('should log citation hover analytics', async ({
              generatedAnswer,
            }) => {
              const citationIndex = 0;
              const {id, permanentid} = genQaData.citations[citationIndex];
              const citationHoverAnalyticRequestPromise =
                generatedAnswer.waitForSourceHoverAnalytics({
                  citationId: id,
                  permanentId: permanentid,
                });
              await generatedAnswer.hoverOverCitation(citationIndex);
              await citationHoverAnalyticRequestPromise;
            });
          });

          test.describe('when clicking on a citation', () => {
            test('should log citation click analytics', async ({
              generatedAnswer,
            }) => {
              const citationIndex = 0;
              const {id, title, source, uri, clickUri, permanentid} =
                genQaData.citations[citationIndex];
              const citationClickAnalyticRequestPromise =
                generatedAnswer.waitForCitationClickAnalytics({
                  documentTitle: title,
                  sourceName: source,
                  documentPosition: citationIndex + 1,
                  documentUri: uri,
                  documentUrl: clickUri,
                  citationId: id,
                  contentIDKey: 'permanentid',
                  contentIDValue: permanentid,
                });
              await generatedAnswer.clickOnCitation(citationIndex);
              await citationClickAnalyticRequestPromise;
            });
          });
        });

        test.describe('when the answer is generated in a single shot and the answer exceeds the maximum height', () => {
          test.use({
            options: {
              collapsible: true,
            },
          });
          test('should display the answer as collapsed', async ({
            generatedAnswer,
          }) => {
            const expectedShowMoreLabel = 'Show more';
            await generatedAnswer.waitForStreamEndAnalytics();

            const showMoreButton = generatedAnswer.showMoreButton;
            expect(showMoreButton).not.toBeNull();

            const showMoreButtonLabel = await showMoreButton.textContent();
            expect(showMoreButtonLabel).not.toBeNull();
            expect(showMoreButtonLabel).toEqual(expectedShowMoreLabel);
          });
        });
      });
    });
  });
});
