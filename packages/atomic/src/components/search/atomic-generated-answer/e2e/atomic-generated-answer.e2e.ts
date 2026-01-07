import {expect, test} from './fixture';

const closePopoverDebounceMs = 100;
const pollTimeoutMs = 2000;

test.describe('atomic-generated-answer', () => {
  test.describe('citations', () => {
    test.describe('with citation anchoring enabled', () => {
      test.beforeEach(async ({generatedAnswer}) => {
        await generatedAnswer.load({story: 'default'});
        await generatedAnswer.waitForCitations();
      });

      test('should render citation when available', async ({
        generatedAnswer,
      }) => {
        const citationCount = await generatedAnswer.getCitationCount();
        expect(citationCount).toBeGreaterThan(0);
        await generatedAnswer.citation.first().screenshot();
      });

      test('should only append text fragment to HTML citations', async ({
        generatedAnswer,
      }) => {
        const citationCount = await generatedAnswer.getCitationCount();

        for (let i = 0; i < citationCount; i++) {
          const filetype = await generatedAnswer.getCitationFiletype(i);
          const href = await generatedAnswer.getCitationHref(i);

          expect(href).toBeTruthy();

          if (filetype === 'html') {
            expect(href).toMatch(/#:~:text=/);
          } else {
            expect(href).not.toMatch(/#:~:text=/);
          }
        }
      });
    });

    test.describe('with citation anchoring disabled', () => {
      test.beforeEach(async ({generatedAnswer}) => {
        await generatedAnswer.load({story: 'disable-citation-anchoring'});
      });

      test('should not have text fragment when citation anchoring is disabled', async ({
        generatedAnswer,
      }) => {
        await generatedAnswer.waitForCitations();
        const href = await generatedAnswer.getCitationHref(0);

        expect(href).toBeTruthy();
        expect(href).not.toContain('#:~:text=');
      });
    });

    test.describe('when hovering on a citation and its popover', () => {
      test.beforeEach(async ({generatedAnswer}) => {
        await generatedAnswer.load({story: 'default'});
        await generatedAnswer.waitForCitations();
      });

      test('should show popover when hovering over citation', async ({
        generatedAnswer,
      }) => {
        const popover = generatedAnswer.citationPopover.first();
        await expect(popover).toHaveClass(/hidden/);
        await expect(popover).not.toBeVisible();

        const citation = generatedAnswer.citation.first();
        await citation.hover();

        await expect
          .poll(async () => await popover.getAttribute('class'), {
            timeout: pollTimeoutMs,
          })
          .toMatch(/desktop-only:flex/);
        await expect(popover).toBeVisible();
        await expect(popover).toContainText(/https?:\/\//);
      });

      test('should still show the popover when moving from citation to popover', async ({
        generatedAnswer,
      }) => {
        const citation = generatedAnswer.citation.first();
        const popover = generatedAnswer.citationPopover.first();
        await expect(popover).toHaveClass(/hidden/);

        await citation.hover();
        await expect
          .poll(async () => await popover.getAttribute('class'), {
            timeout: pollTimeoutMs,
          })
          .toMatch(/desktop-only:flex/);

        // Trigger close debounce by leaving citation
        await citation.dispatchEvent('mouseleave');

        // Immediately cancel close by entering popover
        await popover.dispatchEvent('mouseenter');

        // Wait longer than close debounce (100ms) to ensure cancel worked
        await generatedAnswer.page.waitForTimeout(closePopoverDebounceMs + 100);
        await expect(popover).toHaveClass(/desktop-only:flex/);
        await expect(popover).toBeVisible();
      });

      test('should hide popover after mouse leaves citation', async ({
        generatedAnswer,
      }) => {
        const citation = generatedAnswer.citation.first();
        const popover = generatedAnswer.citationPopover.first();

        await citation.hover();
        await expect
          .poll(async () => await popover.getAttribute('class'), {
            timeout: pollTimeoutMs,
          })
          .toMatch(/desktop-only:flex/);

        await generatedAnswer.page.mouse.move(0, 0);

        await generatedAnswer.page.waitForTimeout(closePopoverDebounceMs + 50);
        await expect
          .poll(async () => await popover.getAttribute('class'), {
            timeout: pollTimeoutMs,
          })
          .toMatch(/hidden/);
      });
    });
  });

  test.describe('generated answer feedback', () => {
    test.beforeEach(async ({generatedAnswer}) => {
      await generatedAnswer.load({story: 'default'});
    });

    ['like', 'dislike'].forEach((feedbackType) => {
      test.describe(`when clicking the ${feedbackType} generated answer button`, () => {
        test(`should open the feedback modal`, async ({generatedAnswer}) => {
          await generatedAnswer.waitForLikeAndDislikeButtons();

          const feedbackButton =
            feedbackType === 'like'
              ? generatedAnswer.likeButton
              : generatedAnswer.dislikeButton;

          await feedbackButton.click();
          await generatedAnswer.waitForModal();
        });

        test('should close the modal when clicking the skip button', async ({
          generatedAnswer,
        }) => {
          await generatedAnswer.waitForLikeAndDislikeButtons();

          const feedbackButton =
            feedbackType === 'like'
              ? generatedAnswer.likeButton
              : generatedAnswer.dislikeButton;

          await feedbackButton.click();
          await generatedAnswer.waitForModal();

          await generatedAnswer.feedbackModalSkipButton.click();
          await generatedAnswer.waitForModalToClose();
        });

        test.describe('when submitting feedback', () => {
          test.describe('when selecting all the required options', () => {
            test('should submit the feedback request, log an analytics event and display the success message', async ({
              generatedAnswer,
            }) => {
              await generatedAnswer.waitForLikeAndDislikeButtons();

              const feedbackButton =
                feedbackType === 'like'
                  ? generatedAnswer.likeButton
                  : generatedAnswer.dislikeButton;

              const expectedHelpfulness = feedbackType === 'like';

              await feedbackButton.click();
              await generatedAnswer.waitForModal();

              await generatedAnswer.fillAllRequiredOptions({
                correctTopic: 'yes',
                hallucinationFree: 'no',
                documented: 'not_sure',
                readable: 'yes',
              });
              await generatedAnswer.feedbackModalCorrectAnswerInput.fill(
                'https://www.example.com/correct-answer'
              );
              await generatedAnswer.feedbackModalAdditionalNotesInput.fill(
                'Additional notes for testing purposes.'
              );

              const evaluationRequestPromise =
                generatedAnswer.waitForEvaluationRequest(expectedHelpfulness);
              const analyticsRequestPromise =
                generatedAnswer.waitForAnalyticsRequest();

              await generatedAnswer.feedbackModalSubmitButton.click();

              const evaluationRequest = await evaluationRequestPromise;
              const requestBody = evaluationRequest.postDataJSON();
              await analyticsRequestPromise;

              const requestBodyDetails = requestBody.details;
              expect(requestBody.helpful).toBe(expectedHelpfulness);
              expect(requestBodyDetails.correctTopic).toBe(true);
              expect(requestBodyDetails.hallucinationFree).toBe(false);
              expect(requestBodyDetails.documented).toBe(null);
              expect(requestBodyDetails.readable).toBe(true);
              expect(requestBody.correctAnswerUrl).toBe(
                'https://www.example.com/correct-answer'
              );

              await expect(
                generatedAnswer.feedbackModalSuccessMessage
              ).toBeVisible();

              await generatedAnswer.feedbackModalSuccessMessageDoneButton.click();
              await generatedAnswer.waitForModalToClose();
            });
          });

          test.describe('when submitting without selecting all the required options', () => {
            test('should display validation message', async ({
              generatedAnswer,
            }) => {
              await generatedAnswer.waitForLikeAndDislikeButtons();

              const feedbackButton =
                feedbackType === 'like'
                  ? generatedAnswer.likeButton
                  : generatedAnswer.dislikeButton;

              await feedbackButton.click();
              await generatedAnswer.waitForModal();

              await generatedAnswer.feedbackModalSubmitButton.click();

              const validationErrors = generatedAnswer.validationErrors;
              await expect(validationErrors.first()).toBeVisible();

              await expect(
                generatedAnswer.feedbackModalSuccessMessage
              ).not.toBeVisible();
            });
          });
        });

        test.describe('after submitting feedback', () => {
          test('should not reopen the feedback modal when clicking like/dislike button again', async ({
            generatedAnswer,
          }) => {
            await generatedAnswer.waitForLikeAndDislikeButtons();

            const feedbackButton =
              feedbackType === 'like'
                ? generatedAnswer.likeButton
                : generatedAnswer.dislikeButton;

            const expectedHelpfulness = feedbackType === 'like';

            await feedbackButton.click();
            await generatedAnswer.waitForModal();

            await generatedAnswer.fillAllRequiredOptions();

            const evaluationRequestPromise =
              generatedAnswer.waitForEvaluationRequest(expectedHelpfulness);

            await generatedAnswer.feedbackModalSubmitButton.click();
            await evaluationRequestPromise;

            await expect(
              generatedAnswer.feedbackModalSuccessMessage
            ).toBeVisible();

            await generatedAnswer.feedbackModalSuccessMessageDoneButton.click();
            await generatedAnswer.waitForModalToClose();

            await feedbackButton.click();

            await expect(generatedAnswer.feedbackModal).not.toHaveAttribute(
              'is-open'
            );
          });

          test('should allow reopening the feedback modal after a new query', async ({
            generatedAnswer,
          }) => {
            await generatedAnswer.waitForLikeAndDislikeButtons();

            const feedbackButton =
              feedbackType === 'like'
                ? generatedAnswer.likeButton
                : generatedAnswer.dislikeButton;

            const expectedHelpfulness = feedbackType === 'like';

            await feedbackButton.click();
            await generatedAnswer.waitForModal();

            await generatedAnswer.fillAllRequiredOptions();

            const evaluationRequestPromise =
              generatedAnswer.waitForEvaluationRequest(expectedHelpfulness);

            await generatedAnswer.feedbackModalSubmitButton.click();
            await evaluationRequestPromise;

            await expect(
              generatedAnswer.feedbackModalSuccessMessage
            ).toBeVisible();

            await generatedAnswer.feedbackModalSuccessMessageDoneButton.click();
            await generatedAnswer.waitForModalToClose();

            await generatedAnswer.load({story: 'default'});
            await generatedAnswer.waitForLikeAndDislikeButtons();

            await feedbackButton.click();
            await generatedAnswer.waitForModal();
          });
        });
      });
    });
  });
});
