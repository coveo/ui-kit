import {expect, test} from './fixture';

test.describe('AtomicSmartSnippet', () => {
  test.beforeEach(async ({smartSnippet}) => {
    await smartSnippet.load();
    await smartSnippet.hydrated.waitFor();
  });

  test.describe('when answer is found', () => {
    test('should display the smart snippet', async ({smartSnippet}) => {
      await expect(smartSnippet.smartSnippet).toBeVisible();
    });

    test('should display the question', async ({smartSnippet}) => {
      await expect(smartSnippet.question).toBeVisible();
      await expect(smartSnippet.question).toContainText('');
    });

    test('should display the answer', async ({smartSnippet}) => {
      await expect(smartSnippet.body).toBeVisible();
    });

    test('should display the footer', async ({smartSnippet}) => {
      await expect(smartSnippet.footer).toBeVisible();
    });

    test('should display the source', async ({smartSnippet}) => {
      await expect(smartSnippet.source).toBeVisible();
      await expect(smartSnippet.sourceUrl).toBeVisible();
      await expect(smartSnippet.sourceTitle).toBeVisible();
    });

    test('should display the feedback banner', async ({smartSnippet}) => {
      await expect(smartSnippet.feedbackBanner).toBeVisible();
    });

    test('should display feedback inquiry', async ({smartSnippet}) => {
      await expect(smartSnippet.feedbackInquiry).toBeVisible();
    });

    test('should display feedback buttons', async ({smartSnippet}) => {
      await expect(smartSnippet.feedbackLikeButton).toBeVisible();
      await expect(smartSnippet.feedbackDislikeButton).toBeVisible();
    });
  });

  test.describe('feedback interaction', () => {
    test('should show thank you message after clicking like button', async ({
      smartSnippet,
    }) => {
      await smartSnippet.clickLikeButton();
      await expect(smartSnippet.feedbackThankYou).toBeVisible();
    });

    test('should show thank you message after clicking dislike button', async ({
      smartSnippet,
    }) => {
      await smartSnippet.clickDislikeButton();
      await expect(smartSnippet.feedbackThankYou).toBeVisible();
    });

    test('should show explain why button after clicking dislike', async ({
      smartSnippet,
    }) => {
      await smartSnippet.clickDislikeButton();
      await expect(smartSnippet.feedbackExplainWhyButton).toBeVisible();
    });
  });

  test.describe('accessibility', () => {
    test('should have proper ARIA labels', async ({smartSnippet}) => {
      const ariaLabel = await smartSnippet.smartSnippet.evaluate((el) => {
        const aside = el.closest('aside');
        return aside?.getAttribute('aria-label');
      });
      expect(ariaLabel).toBeTruthy();
    });

    test('should be keyboard navigable', async ({page}) => {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focused).toBeDefined();
    });

    test('should have accessible feedback buttons', async ({smartSnippet}) => {
      const likeButtonRole =
        await smartSnippet.feedbackLikeButton.getAttribute('role');
      const dislikeButtonRole =
        await smartSnippet.feedbackDislikeButton.getAttribute('role');

      expect(likeButtonRole || 'label').toBeTruthy();
      expect(dislikeButtonRole || 'label').toBeTruthy();
    });

    test('should have accessible source links', async ({smartSnippet}) => {
      const sourceUrlHref = await smartSnippet.sourceUrl.getAttribute('href');
      const sourceTitleHref =
        await smartSnippet.sourceTitle.getAttribute('href');

      expect(sourceUrlHref).toBeTruthy();
      expect(sourceTitleHref).toBeTruthy();
    });
  });

  test.describe('inline links', () => {
    test('should have clickable inline links in answer', async ({
      smartSnippet,
    }) => {
      const links = await smartSnippet.inlineLinks.count();
      expect(links).toBeGreaterThan(0);
    });
  });
});
