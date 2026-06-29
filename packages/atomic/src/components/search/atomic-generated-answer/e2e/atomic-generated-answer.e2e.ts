import {expect, test} from './fixture';

const closePopoverDebounceMs = 100;
const pollTimeoutMs = 5000;

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
        // Wait for component to be fully ready before hover
        await citation.waitFor({state: 'visible'});
        await citation.dispatchEvent('mouseover');

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

        // Wait for component to be fully ready before hover
        await citation.waitFor({state: 'visible'});
        await citation.dispatchEvent('mouseover');
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

        // Wait for component to be fully ready before hover
        await citation.waitFor({state: 'visible'});
        await citation.dispatchEvent('mouseover');
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
          const feedbackButton =
            feedbackType === 'like'
              ? generatedAnswer.likeButton
              : generatedAnswer.dislikeButton;

          await feedbackButton.click();
          await generatedAnswer.waitForModalToOpen();
        });

        test('should close the modal when clicking the skip button', async ({
          generatedAnswer,
        }) => {
          const feedbackButton =
            feedbackType === 'like'
              ? generatedAnswer.likeButton
              : generatedAnswer.dislikeButton;

          await feedbackButton.click();
          await generatedAnswer.waitForModalToOpen();

          await generatedAnswer.feedbackModalSkipButton.click();
          await generatedAnswer.waitForModalToClose();
        });

        test.describe('when submitting feedback', () => {
          test.describe('when selecting all the required options', () => {
            test('should submit the feedback request, log an analytics event and display the success message', async ({
              generatedAnswer,
            }) => {
              const feedbackButton =
                feedbackType === 'like'
                  ? generatedAnswer.likeButton
                  : generatedAnswer.dislikeButton;

              const expectedHelpfulness = feedbackType === 'like';

              await feedbackButton.click();
              await generatedAnswer.waitForModalToOpen();

              await generatedAnswer.fillAllRequiredOptions({
                correctTopic: 'Yes',
                hallucinationFree: 'No',
                documented: 'Not Sure',
                readable: 'Yes',
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
            test('should display a validation error message', async ({
              generatedAnswer,
            }) => {
              const feedbackButton =
                feedbackType === 'like'
                  ? generatedAnswer.likeButton
                  : generatedAnswer.dislikeButton;

              await feedbackButton.click();
              await generatedAnswer.waitForModalToOpen();

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
            const feedbackButton =
              feedbackType === 'like'
                ? generatedAnswer.likeButton
                : generatedAnswer.dislikeButton;

            const expectedHelpfulness = feedbackType === 'like';

            await feedbackButton.click();
            await generatedAnswer.waitForModalToOpen();

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
            const feedbackButton =
              feedbackType === 'like'
                ? generatedAnswer.likeButton
                : generatedAnswer.dislikeButton;

            const expectedHelpfulness = feedbackType === 'like';

            await feedbackButton.click();
            await generatedAnswer.waitForModalToOpen();

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

            await feedbackButton.click();
            await generatedAnswer.waitForModalToOpen();
          });
        });
      });
    });
  });

  test.describe('with legacy analytics', () => {
    test('should log an analytics event with the legacy analytics mode', async ({
      generatedAnswer,
    }) => {
      const analyticsRequestPromise =
        generatedAnswer.waitForLegacyAnalyticsSearchboxSubmitRequest();

      await generatedAnswer.load({story: 'with-legacy-analytics'});

      const analyticsRequest = await analyticsRequestPromise;
      const requestBody = analyticsRequest.postDataJSON();

      expect(requestBody.actionCause).toBe('searchboxSubmit');
    });
  });

  test.describe('search agent follow-up experience', () => {
    const streamingTimeoutMs = 10000;

    test('happy path: head answer, follow-up, and second follow-up', async ({
      generatedAnswer,
    }) => {
      const streamEndPromise =
        generatedAnswer.waitForStreamEndAnalyticsRequest();

      await generatedAnswer.load({story: 'with-agent-id'});

      await test.step('generate head answer', async () => {
        await expect(generatedAnswer.streamOfThought).toBeVisible({
          timeout: streamingTimeoutMs,
        });
        await expect(generatedAnswer.followUpSubmitButton).toBeDisabled({
          timeout: streamingTimeoutMs,
        });
        await expect(generatedAnswer.followUpSubmitButton).toBeEnabled({
          timeout: streamingTimeoutMs,
        });
        await expect(generatedAnswer.generatedTexts.first()).toBeVisible();
        await streamEndPromise;
      });

      await test.step('generate first follow-up', async () => {
        await generatedAnswer.followUpInput.fill('What else should I try?');
        await generatedAnswer.followUpSubmitButton.click();

        await expect(generatedAnswer.threadItems).toHaveCount(2, {
          timeout: streamingTimeoutMs,
        });
        await expect(generatedAnswer.generatedTexts).toHaveCount(2);
        await expect(generatedAnswer.generatedTexts.last()).toBeVisible();

        const previousItemCollapseButton = generatedAnswer.threadItems
          .first()
          .locator('button', {
            has: generatedAnswer.page.locator('[part="thread-item-title"]'),
          });
        await expect(previousItemCollapseButton).toHaveAttribute(
          'aria-expanded',
          'false'
        );
      });

      await test.step('copy follow-up answer to clipboard', async () => {
        await generatedAnswer.page
          .context()
          .grantPermissions(['clipboard-read', 'clipboard-write']);

        const copyButton = generatedAnswer.threadItems
          .last()
          .locator('[part="copy-button"]');
        await copyButton.click();

        const clipboardContent = await generatedAnswer.page.evaluate(() =>
          navigator.clipboard.readText()
        );
        expect(clipboardContent).toContain('Resolving Netflix Connection');
      });

      await test.step('like the follow-up answer', async () => {
        const likeButton = generatedAnswer.threadItems
          .last()
          .getByRole('button', {name: /^helpful$/i});
        await likeButton.click();
        await expect(likeButton).toHaveAttribute('aria-pressed', 'true');
      });

      await test.step('dislike the follow-up answer', async () => {
        const dislikeButton = generatedAnswer.threadItems
          .last()
          .getByRole('button', {name: /^not helpful$/i});
        await dislikeButton.click();
        const likeButton = generatedAnswer.threadItems
          .last()
          .getByRole('button', {name: /^helpful$/i});
        await expect(dislikeButton).toHaveAttribute('aria-pressed', 'true');
        await expect(likeButton).toHaveAttribute('aria-pressed', 'false');
      });

      await test.step('hover citation and display popover', async () => {
        const citation = generatedAnswer.threadItems
          .last()
          .locator('[part="citation"]')
          .first();
        await citation.hover();

        const popover = generatedAnswer.threadItems
          .last()
          .locator('[part="citation-popover"]')
          .first();
        await expect(popover).toBeVisible();
      });

      await test.step('render citation as clickable link', async () => {
        const citationLink = generatedAnswer.threadItems
          .last()
          .getByRole('link')
          .first();
        await expect(citationLink).toHaveAttribute('href', /^https?:\/\//);
      });

      await test.step('collapse and expand thread items', async () => {
        const collapseButton = generatedAnswer.threadItems
          .first()
          .locator('button', {
            has: generatedAnswer.page.locator('[part="thread-item-title"]'),
          });

        await expect(collapseButton).toHaveAttribute('aria-expanded', 'false');
        await collapseButton.click();
        await expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
        await collapseButton.click();
        await expect(collapseButton).toHaveAttribute('aria-expanded', 'false');
        await expect(
          generatedAnswer.threadItems.first().locator('[hidden]')
        ).toHaveCount(1);
      });

      await test.step('generate second follow-up', async () => {
        await expect(generatedAnswer.followUpSubmitButton).toBeEnabled({
          timeout: streamingTimeoutMs,
        });
        await generatedAnswer.followUpInput.fill('Second follow-up');
        await generatedAnswer.followUpSubmitButton.click();

        await expect(generatedAnswer.threadItems).toHaveCount(1, {
          timeout: streamingTimeoutMs,
        });
        await expect(generatedAnswer.showPreviousButton).toBeVisible();
      });

      await test.step('like third answer and verify first answer is unaffected', async () => {
        const thirdAnswerLikeButton = generatedAnswer.threadItems
          .last()
          .getByRole('button', {name: /^helpful$/i});
        await thirdAnswerLikeButton.click();
        await expect(thirdAnswerLikeButton).toHaveAttribute(
          'aria-pressed',
          'true'
        );

        await generatedAnswer.showPreviousButton.click();

        const firstItemCollapseButton = generatedAnswer.threadItems
          .first()
          .locator('button', {
            has: generatedAnswer.page.locator('[part="thread-item-title"]'),
          });
        await firstItemCollapseButton.click();

        const firstAnswerLikeButton = generatedAnswer.threadItems
          .first()
          .getByRole('button', {name: /^helpful$/i});
        await expect(firstAnswerLikeButton).toHaveAttribute(
          'aria-pressed',
          'false'
        );
      });
    });

    test('interactions with 2nd answer send correct conversationId and answerId', async ({
      generatedAnswer,
    }) => {
      await generatedAnswer.load({story: 'with-agent-id'});
      await expect(generatedAnswer.followUpSubmitButton).toBeEnabled({
        timeout: streamingTimeoutMs,
      });

      await generatedAnswer.followUpInput.fill('First follow-up');
      await generatedAnswer.followUpSubmitButton.click();
      await expect(generatedAnswer.threadItems).toHaveCount(2, {
        timeout: streamingTimeoutMs,
      });
      await expect(generatedAnswer.followUpSubmitButton).toBeEnabled({
        timeout: streamingTimeoutMs,
      });

      await generatedAnswer.followUpInput.fill('Second follow-up');
      await generatedAnswer.followUpSubmitButton.click();
      await expect(generatedAnswer.showPreviousButton).toBeVisible({
        timeout: streamingTimeoutMs,
      });

      await generatedAnswer.showPreviousButton.click();
      const secondAnswerItem = generatedAnswer.threadItems.nth(1);

      // Expand the 2nd thread item (collapsed by default after 'show previous')
      const expandButton = secondAnswerItem.getByRole('button', {
        name: /first follow-up/i,
      });
      await expandButton.click();

      await test.step('like 2nd answer', async () => {
        const likePromise = generatedAnswer.waitForCustomAnalyticsEvent(
          'likeGeneratedAnswer'
        );
        const likeButton = secondAnswerItem.getByRole('button', {
          name: /^helpful$/i,
        });
        await likeButton.click();
        const request = await likePromise;
        const body = request.postDataJSON();
        expect(body.customData.generativeQuestionAnsweringId).toBeTruthy();
        expect(body.customData.conversationId).toBe('thread-1');
      });

      await test.step('dislike 2nd answer', async () => {
        const dislikePromise = generatedAnswer.waitForCustomAnalyticsEvent(
          'dislikeGeneratedAnswer'
        );
        const dislikeButton = secondAnswerItem.getByRole('button', {
          name: /^not helpful$/i,
        });
        await dislikeButton.click();
        const request = await dislikePromise;
        const body = request.postDataJSON();
        expect(body.customData.generativeQuestionAnsweringId).toBeTruthy();
        expect(body.customData.conversationId).toBe('thread-1');
      });

      await test.step('copy 2nd answer to clipboard', async () => {
        await generatedAnswer.page
          .context()
          .grantPermissions(['clipboard-read', 'clipboard-write']);

        const copyPromise = generatedAnswer.waitForCustomAnalyticsEvent(
          'generatedAnswerCopyToClipboard'
        );
        const copyButton = secondAnswerItem.locator('[part="copy-button"]');
        await copyButton.click();
        const request = await copyPromise;
        const body = request.postDataJSON();
        expect(body.customData.generativeQuestionAnsweringId).toBeTruthy();
        expect(body.customData.conversationId).toBe('thread-1');
      });

      await test.step('hover citation on 2nd answer', async () => {
        const hoverPromise = generatedAnswer.waitForCustomAnalyticsEvent(
          'generatedAnswerSourceHover'
        );
        const citation = secondAnswerItem.locator('[part="citation"]').first();
        await citation.hover();
        // Wait longer than the popover debounce (200ms) + hover analytics threshold (1000ms)
        await generatedAnswer.page.waitForTimeout(1500);
        await generatedAnswer.page.mouse.move(0, 0);
        const request = await hoverPromise;
        const body = request.postDataJSON();
        expect(body.customData.generativeQuestionAnsweringId).toBeTruthy();
        expect(body.customData.conversationId).toBe('thread-1');
      });

      await test.step('click citation on 2nd answer', async () => {
        const clickPromise = generatedAnswer.waitForCustomAnalyticsEvent(
          'generatedAnswerFollowupOpenSource'
        );
        const citationLink = secondAnswerItem
          .locator('[part="citation"]')
          .first();
        await citationLink.click();
        const request = await clickPromise;
        const body = request.postDataJSON();
        expect(body.customData.generativeQuestionAnsweringId).toBeTruthy();
        expect(body.customData.conversationId).toBe('thread-1');
      });

      await test.step('submit follow-up from 2nd answer', async () => {
        const followUpPromise = generatedAnswer.waitForFollowUpRequest();
        await generatedAnswer.followUpInput.fill('Follow-up from 2nd');
        await generatedAnswer.followUpSubmitButton.click();
        const request = await followUpPromise;
        const body = request.postDataJSON();
        expect(body.conversationId).toBe('thread-1');
      });
    });
  });
});
