import {expect, test} from './fixture';

test.describe('atomic-result-link', () => {
  test.beforeEach(async ({resultLink}) => {
    await resultLink.load();
    await resultLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should render as links', async ({resultLink, page}) => {
    await expect(resultLink.anchor().first()).toHaveAttribute('href');

    await resultLink.anchor().first().click({force: true});
    expect(page.url()).not.toBe('about:blank');
  });

  test('should send click analytics event when clicking the link', async ({
    resultLink,
    page,
  }) => {
    const analyticsUrlRegex =
      /https:\/\/.*\.analytics\.coveo\.com\/rest\/.*\/analytics\/.*/;
    const requestPromise = page.waitForRequest(analyticsUrlRegex);
    await resultLink.anchor().first().click();
    const request = await requestPromise;

    // Due to a bug in chromium, we cannot access the request payload in tests.
    // See https://github.com/microsoft/playwright/issues/6479
    expect(request).toBeDefined();
  });
});
