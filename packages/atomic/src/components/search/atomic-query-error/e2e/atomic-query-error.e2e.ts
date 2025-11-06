import {expect, test} from './fixture';

test.describe('AtomicQueryError', () => {
  test.describe('when there is an invalid token', () => {
    test('should display the component with the correct content', async ({
      queryError,
    }) => {
      await queryError.load();

      await expect(queryError.title).toBeVisible();
      await expect(queryError.description).toBeVisible();
      await expect(queryError.infoButton).toBeVisible();
    });
  });

  test.describe('when there is a 419 error', () => {
    test('should display the component with the correct content', async ({
      queryError,
    }) => {
      await queryError.load({story: 'with-419-error'});

      await expect(queryError.title).toBeVisible();
      await expect(queryError.description).toBeVisible();
      await expect(queryError.infoButton).toBeVisible();
    });
  });
});
