import {expect, test} from './fixture';

test.describe('atomic-recs-interface', () => {
  test.describe('when interface has not been initialized', () => {
    test.beforeEach(async ({recsInterface}) => {
      await recsInterface.load({
        story: 'recs-before-init',
      });
    });

    test('should return error if request is executed', async ({page}) => {
      const beforeInitError =
        'You have to call "initialize" on the atomic-recs-interface component before modifying the props or calling other public methods.';

      let errorMessage = '';

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errorMessage = msg.text();
        }
      });

      await page.waitForEvent('console', {
        predicate: (msg) =>
          msg.type() === 'error' && msg.text().includes(beforeInitError),
        timeout: 5000,
      });

      expect(errorMessage).toContain(beforeInitError);
    });
  });

  test.describe('when recommendations are loaded', () => {
    test.beforeEach(async ({recsInterface}) => {
      await recsInterface.load({
        story: 'with-recs-list',
      });
    });

    test('should display the recs interface', async ({recsInterface}) => {
      await expect(recsInterface.interface()).toBeVisible();
    });

    test('should display the recs list', async ({recsInterface}) => {
      await expect(recsInterface.recsList()).toBeVisible();
    });

    test('should display recommendation results', async ({recsInterface}) => {
      await recsInterface.hydrated.waitFor();
      const results = recsInterface.recsResults();
      await expect(results.first()).toBeVisible();
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display result links that are clickable', async ({
      recsInterface,
    }) => {
      await recsInterface.hydrated.waitFor();
      const firstResultLink = recsInterface
        .getResultLink(0)
        .locator('a')
        .first();
      await expect(firstResultLink).toBeVisible();
      await expect(firstResultLink).toHaveAttribute('href');
    });
  });
});
