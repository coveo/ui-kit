import {expect, test} from './fixture';

const testScenarios = [
  {
    name: 'with answer-configuration-id',
    args: {
      answerConfigurationId: 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
    },
  },
  {
    name: 'without answer-configuration-id',
    args: {
      answerConfigurationId: undefined,
    },
  },
];

test.describe('atomic-generated-answer - Happy Path', () => {
  testScenarios.forEach(({name, args}) => {
    test.describe(name, () => {
      test.beforeEach(async ({generatedAnswer}) => {
        await generatedAnswer.load({story: 'default', args});
        await generatedAnswer.hydrated.first().waitFor({state: 'visible'});
      });

      test('should complete full user journey: view answer → like → feedback → citations → navigation', async ({
        generatedAnswer,
        page,
      }) => {
        await test.step('Wait for and verify generated answer text is displayed', async () => {
          await generatedAnswer.waitForGeneratedText();
          await expect(generatedAnswer.generatedText).toBeVisible();
          const textContent = await generatedAnswer.generatedText.textContent();
          expect(textContent).toBeTruthy();
          expect(textContent!.length).toBeGreaterThan(0);
        });

        await test.step('Like the answer', async () => {
          expect(await generatedAnswer.isLikeButtonActive()).toBe(false);
          await generatedAnswer.clickLikeButton();
          expect(await generatedAnswer.isLikeButtonActive()).toBe(true);
        });

        await test.step('Open and fill feedback modal', async () => {
          await generatedAnswer.waitForFeedbackModal();
          expect(await generatedAnswer.isFeedbackModalOpen()).toBe(true);

          await generatedAnswer.fillFeedbackForm({
            correctTopic: 'yes',
            hallucinationFree: 'yes',
            documented: 'yes',
            readable: 'yes',
            details: 'This is a great answer!',
          });
        });

        await test.step('Submit feedback', async () => {
          await generatedAnswer.submitFeedback();
          await generatedAnswer.page.waitForTimeout(500);
          expect(await generatedAnswer.isFeedbackModalOpen()).toBe(false);
        });

        await test.step('Verify citations are displayed', async () => {
          await generatedAnswer.waitForCitations();
          const citationCount = await generatedAnswer.getCitationCount();
          expect(citationCount).toBeGreaterThan(0);
        });

        await test.step('Click on citation and verify navigation', async () => {
          const firstCitationHref = await generatedAnswer.getCitationHref(0);
          expect(firstCitationHref).toBeTruthy();

          const navigationPromise = page.waitForURL(/.*/, {timeout: 5000});
          await generatedAnswer.citation.first().click();

          await expect(navigationPromise).resolves.not.toThrow();
        });
      });
    });
  });
});

test.describe('atomic-generated-answer - Citations', () => {
  test.describe('with citation anchoring enabled', () => {
    test.beforeEach(async ({generatedAnswer}) => {
      await generatedAnswer.load({story: 'default'});
      await generatedAnswer.waitForCitations();
    });

    test('should render citation when available', async ({generatedAnswer}) => {
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
});
