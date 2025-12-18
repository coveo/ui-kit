import {expect, test} from './fixture';

test.describe('atomic-insight-full-search-button', () => {
  test.beforeEach(async ({fullSearchButton}) => {
    await fullSearchButton.load();
  });

  test('should display the full search button', async ({fullSearchButton}) => {
    await expect(fullSearchButton.button).toBeVisible();
  });

  test('should have the correct aria-label', async ({fullSearchButton}) => {
    await expect(fullSearchButton.button).toHaveAttribute(
      'aria-label',
      'full-search'
    );
  });

  test.describe('accessibility', () => {
    test('should have accessible button role', async ({fullSearchButton}) => {
      await expect(fullSearchButton.button).toHaveRole('button');
    });

    test('should be keyboard accessible', async ({fullSearchButton, page}) => {
      await page.keyboard.press('Tab');
      await expect(fullSearchButton.button).toBeFocused();
    });
  });

  test.describe('with tooltip', () => {
    test('should display custom tooltip', async ({fullSearchButton}) => {
      const customTooltip = 'Go to full search';
      await fullSearchButton.load({
        args: {
          tooltip: customTooltip,
        },
      });

      await expect(fullSearchButton.button).toHaveAttribute(
        'title',
        customTooltip
      );
    });
  });
});
