import {expect, test} from './fixture';

test.describe('atomic-recs-result-template', () => {
  test.describe('when used as a child of a recs list', () => {
    test('should display recommendation results', async ({
      recsResultTemplate,
      page,
    }) => {
      await recsResultTemplate.load({story: 'default'});
      await page.waitForLoadState('networkidle');

      await expect(recsResultTemplate.result).toBeVisible();
    });
  });

  test.describe('with minimal template', () => {
    test('should display recommendation results with minimal content', async ({
      recsResultTemplate,
      page,
    }) => {
      await recsResultTemplate.load({story: 'with-minimal-template'});
      await page.waitForLoadState('networkidle');

      await expect(recsResultTemplate.result).toBeVisible();
      await expect(recsResultTemplate.resultLink).toBeVisible();
    });
  });

  test.describe('with link slot', () => {
    test('should display recommendation results with custom link behavior', async ({
      recsResultTemplate,
      page,
    }) => {
      await recsResultTemplate.load({story: 'with-link-slot'});
      await page.waitForLoadState('networkidle');

      await expect(recsResultTemplate.result).toBeVisible();
    });
  });
});
