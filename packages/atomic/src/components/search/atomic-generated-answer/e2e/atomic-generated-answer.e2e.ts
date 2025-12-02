import {expect, test} from './fixture';

test.describe('atomic-generated-answer citation', () => {
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
      const initiallyVisible = await generatedAnswer.isPopoverVisible(0);
      expect(initiallyVisible).toBe(false);

      await generatedAnswer.hoverCitation(0);

      // Wait a bit for the popover to appear
      await generatedAnswer.page.waitForTimeout(100);

      const popover = generatedAnswer.citationPopover.first();
      await expect(popover).toBeVisible();
      await expect(popover).toContainText(/https?:\/\//);
    });

    test('should still show popover when hovering from the citation to the popover', async ({
      generatedAnswer,
    }) => {
      await generatedAnswer.hoverCitation(0);
      await generatedAnswer.page.waitForTimeout(100);
      const popover = generatedAnswer.citationPopover.first();
      await expect(popover).toBeVisible();

      // Move mouse to the popover
      const popoverBox = await popover.boundingBox();
      expect(popoverBox).not.toBeNull();
      if (popoverBox) {
        await generatedAnswer.page.mouse.move(
          popoverBox.x + popoverBox.width / 2,
          popoverBox.y + popoverBox.height / 2
        );
      }

      // Wait a bit to ensure no hide is triggered
      await generatedAnswer.page.waitForTimeout(150);
      await expect(popover).toBeVisible();
    });

    test('should hide popover after mouse leaves citation', async ({
      generatedAnswer,
    }) => {
      await generatedAnswer.hoverCitation(0);
      await generatedAnswer.page.waitForTimeout(100);

      const popover = generatedAnswer.citationPopover.first();
      await expect(popover).toBeVisible();

      // Move mouse away from citation
      await generatedAnswer.page.mouse.move(0, 0);

      // Wait for debounce timeout (100ms) plus a bit extra
      await generatedAnswer.page.waitForTimeout(200);
      await expect(popover).toBeHidden();
    });
  });
});
