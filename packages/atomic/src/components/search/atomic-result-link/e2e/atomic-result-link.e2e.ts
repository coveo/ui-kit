import {expect, test} from './fixture';

test.describe('atomic-result-link', () => {
  test.beforeEach(async ({resultLink}) => {
    await resultLink.load();
    await resultLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should have href attribute set to result clickUri', async ({
    resultLink,
  }) => {
    const anchor = resultLink.anchor().first();
    await expect(anchor).toHaveAttribute('href');
    await expect(anchor).toBeVisible();
  });

  test('should render as links and be clickable', async ({
    resultLink,
    page,
  }) => {
    await expect(resultLink.anchor().first()).toHaveAttribute('href');

    await resultLink.anchor().first().click({force: true});
    expect(page.url()).not.toBe('about:blank');
  });

  test('should render atomic-result-text when no default slot provided', async ({
    resultLink,
  }) => {
    const resultText = resultLink.page.locator('atomic-result-text').first();
    await expect(resultText).toBeVisible();
    await expect(resultText).toHaveAttribute('field', 'title');
    await expect(resultText).toHaveAttribute('default', 'no-title');
  });
});
