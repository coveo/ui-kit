import {expect, test} from './fixture';

test.describe('AtomicQueryError', () => {
  test('should be accessible', async ({makeAxeBuilder, queryError}) => {
    await queryError.load();
    await queryError.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test.describe('when there is an invalid token', () => {
    test('should display the component with the correct content', async ({
      queryError,
    }) => {
      await queryError.load();

      await expect(queryError.title).toBeVisible();
      await expect(queryError.description).toBeVisible();
      await expect(queryError.docLink).toBeVisible();
    });
  });

  test.describe('when there is a 419 error', () => {
    test('should display the component with the correct content', async ({
      queryError,
    }) => {
      await queryError.with419Error();
      await queryError.load();

      await expect(queryError.title419).toBeVisible();
      await expect(queryError.description419).toBeVisible();
      await expect(queryError.infoButton).toBeVisible();
    });
  });
});
