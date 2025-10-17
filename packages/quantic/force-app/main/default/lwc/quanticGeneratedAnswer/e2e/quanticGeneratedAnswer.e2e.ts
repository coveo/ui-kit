import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import genQaData from './data';
import {analyticsModeTest} from '../../../../../../playwright/utils/analyticsMode';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const exampleAnswerConfigurationId = 'fc581be0-6e61-4039-ab26-a3f2f52f308f';

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

        const configurations = [
          {
            name: 'with answerConfigurationId',
            options: {
              answerConfigurationId: exampleAnswerConfigurationId,
            },
          },
          {
            name: 'without answerConfigurationId',
            options: {},
          },
        ];

        for (const config of configurations) {
          test.describe(config.name, () => {
            test.use({analyticsMode: analytics.mode, options: config.options});

            test.describe('when the answer has been generated', () => {
              test('should send a stream end analytics event', async ({
                generatedAnswer,
              }) => {
                await generatedAnswer.streamEndAnalyticRequestPromise;
              });

              if (config.options.answerConfigurationId) {
                test('should send searchboxSubmit as the action cause in the analytics payload of the generate request', async ({
                  generatedAnswer,
                }) => {
                  await generatedAnswer.streamEndAnalyticRequestPromise;
                  const generateRequest =
                    await generatedAnswer.generateRequestPromise;
                  const generateRequestBody = generateRequest.postDataJSON();
                  expect(generateRequestBody.analytics.actionCause).toBe(
                    'searchboxSubmit'
                  );
                });
              }
            });

            test.describe('when providing positive feedback', () => {
              test('should send positive feedback analytics containing all details', async ({
                generatedAnswer,
              }) => {
                await generatedAnswer.streamEndAnalyticRequestPromise;
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
                await generatedAnswer.typeInFeedbackDetailsInput(
                  exampleDetails
                );

                const feedbackRequestPromise =
                  generatedAnswer.waitForFeedbackSubmitRequest({
                    correctTopic: 'yes',
                    hallucinationFree: 'yes',
                    documented: 'unknown',
                    readable: 'yes',
                    documentUrl: exampleDocumentUrl,
                    details: exampleDetails,
                    helpful: true,
                  });

                await generatedAnswer.clickSubmitFeedbackButton();
                await feedbackRequestPromise;
              });

              test('should keep sending RGA analytics events after submitting feedback', async ({
                generatedAnswer,
              }) => {
                await generatedAnswer.streamEndAnalyticRequestPromise;
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
                await generatedAnswer.typeInFeedbackDetailsInput(
                  exampleDetails
                );

                const feedbackRequestPromise =
                  generatedAnswer.waitForFeedbackSubmitRequest({
                    correctTopic: 'yes',
                    hallucinationFree: 'yes',
                    documented: 'unknown',
                    readable: 'yes',
                    documentUrl: exampleDocumentUrl,
                    details: exampleDetails,
                    helpful: true,
                  });

                await generatedAnswer.clickSubmitFeedbackButton();
                await feedbackRequestPromise;

                await generatedAnswer.clickCompleteFeedbackButton();

                // Click the copy to clipboard button and ensure the analytic is sent.
                const copyToClipboardAnalyticRequestPromise =
                  generatedAnswer.waitForCopyToClipboardAnalytics();
                await generatedAnswer.clickCopyToClipboardButton();
                await copyToClipboardAnalyticRequestPromise;
              });
            });

            test.describe('when providing negative feedback', () => {
              test('should send negative feedback analytics containing all details', async ({
                generatedAnswer,
              }) => {
                await generatedAnswer.streamEndAnalyticRequestPromise;
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
                await generatedAnswer.typeInFeedbackDetailsInput(
                  exampleDetails
                );

                const feedbackRequestPromise =
                  generatedAnswer.waitForFeedbackSubmitRequest({
                    correctTopic: 'no',
                    hallucinationFree: 'unknown',
                    documented: 'no',
                    readable: 'no',
                    documentUrl: exampleDocumentUrl,
                    details: exampleDetails,
                    helpful: false,
                  });
                await generatedAnswer.clickSubmitFeedbackButton();
                await feedbackRequestPromise;
              });
            });

            test.describe('when copying the generated answer to clipboard', () => {
              test('should send a copy to clipboard analytics event', async ({
                generatedAnswer,
              }) => {
                await generatedAnswer.streamEndAnalyticRequestPromise;
                const analyticRequestPromise =
                  generatedAnswer.waitForCopyToClipboardAnalytics();
                await generatedAnswer.clickCopyToClipboardButton();
                await analyticRequestPromise;
              });
            });

            test.describe('when the property withToggle is set to true', () => {
              test.use({
                options: {
                  ...config.options,
                  withToggle: true,
                },
              });

              test('should allow toggling the generated OFF and ON and log analytics', async ({
                generatedAnswer,
              }) => {
                await generatedAnswer.streamEndAnalyticRequestPromise;
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
                  await generatedAnswer.streamEndAnalyticRequestPromise;
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
                  await generatedAnswer.streamEndAnalyticRequestPromise;
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
                  ...config.options,
                  collapsible: true,
                },
              });
              test('should display the answer as collapsed', async ({
                generatedAnswer,
              }) => {
                const expectedShowMoreLabel = 'Show more';
                await generatedAnswer.streamEndAnalyticRequestPromise;

                const showMoreButton = generatedAnswer.showMoreButton;
                expect(showMoreButton).not.toBeNull();

                const showMoreButtonLabel = await showMoreButton.textContent();
                expect(showMoreButtonLabel).not.toBeNull();
                expect(showMoreButtonLabel).toEqual(expectedShowMoreLabel);
              });
            });

            if (config.options.answerConfigurationId) {
              test.describe('when selecting a timeframe facet after the answer is generated', () => {
                test.use({
                  options: {
                    ...config.options,
                  },
                  withFacets: true,
                });

                test('should trigger a new generate call to the answer API', async ({
                  generatedAnswer,
                  baseFacet,
                }) => {
                  await generatedAnswer.streamEndAnalyticRequestPromise;

                  const generateRequestPromise =
                    generatedAnswer.waitForGenerateRequest();

                  const streamEndAnalyticRequestPromise =
                    generatedAnswer.waitForStreamEndAnalytics();

                  const searchResponsePromise =
                    baseFacet.waitForSearchResponse();

                  await generatedAnswer.clickFirstTimeframeFacetLink();

                  const generateRequest = await generateRequestPromise;
                  const generateRequestBody = generateRequest.postDataJSON();
                  expect(generateRequestBody.analytics.actionCause).toBe(
                    'facetSelect'
                  );
                  await streamEndAnalyticRequestPromise;
                  await searchResponsePromise;
                });
              });
            }
          });
        }
      });
    });
  });
});
