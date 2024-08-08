import {test, expect, triggerError} from './fixture';

test.describe('when search returns an error', () => {
  test.beforeEach(async ({queryError}) => {
    await queryError.load();
    await triggerError(queryError.page);
  });

  test('should be A11y compliant', async ({queryError, makeAxeBuilder}) => {
    await queryError.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should update aria-live message', async ({queryError}) => {
    await expect(queryError.ariaLive).toHaveText(
      'Something went wrong. If the problem persists contact the administrator.'
    );
  });

  test('should display an error title', async ({queryError}) => {
    await expect(queryError.title).toBeVisible();
  });
  test('should display an error description', async ({queryError}) => {
    await expect(queryError.description).toBeVisible();
    await expect(queryError.description).toHaveText(
      'If the problem persists contact the administrator.'
    );
  });

  test('should display an icon', async ({queryError}) => {
    await expect(queryError.icon).toBeVisible();
  });
  test('should render a show more info button that displays error information on click', async ({
    queryError,
  }) => {
    await queryError.moreInfoButton.click();
    await expect(queryError.moreInfoMessage).toBeVisible();
    await expect(queryError.moreInfoMessage).toContainText(
      'message": "Something very weird just happened"'
    );
  });
});
