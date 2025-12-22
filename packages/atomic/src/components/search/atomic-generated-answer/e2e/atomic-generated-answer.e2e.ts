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
    const feedbackTypes = [
      {
        type: 'like',
        buttonSelector: 'button[aria-label="I like this answer"]',
      },
      {
        type: 'dislike',
        buttonSelector: 'button[aria-label="I dislike this answer"]',
      }
    ];
    feedbackTypes.forEach(({type, buttonSelector}) => {
      test.describe(`when clicking the ${type} button`, () => {
        test(`should send analytics event and open feedback modal`, async ({generatedAnswer, analytics}) => {});
        test('should close the modal when clicking the skip button', async ({generatedAnswer}) => {});
        test.describe('when submitting feedback', () => {
          test('should send analytics event with the feedback and display the success message', async ({generatedAnswer, analytics}) => {});
          test.describe('when submitting without selecting the required options', () => {
            test('should display validation message', async ({generatedAnswer}) => {});
            test('should not send analytics event', async ({generatedAnswer}) => {});
          });
        });
        test(`should send analytics event again when clicking the ${type === 'like' ? 'dislike' : 'like'} after clicking the ${type} button`, async ({generatedAnswer, analytics}) => {});
      });
    });
  });
});
