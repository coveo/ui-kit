import {expect, test} from './fixture';

test.describe('atomic-ipx-result-link', () => {
  test.beforeEach(async ({ipxResultLink}) => {
    await ipxResultLink.load();
    await ipxResultLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should have href attribute set to result clickUri', async ({
    ipxResultLink,
  }) => {
    const anchor = ipxResultLink.anchor().first();
    await expect(anchor).toHaveAttribute('href');
    await expect(anchor).toBeVisible();
  });

  test('should render as links and be clickable', async ({
    ipxResultLink,
    page,
  }) => {
    await expect(ipxResultLink.anchor().first()).toHaveAttribute('href');

    await ipxResultLink.anchor().first().click({force: true});
    expect(page.url()).not.toBe('about:blank');
  });

  test('should render atomic-result-text when no default slot provided', async ({
    ipxResultLink,
  }) => {
    const resultText = ipxResultLink.page.locator('atomic-result-text').first();
    await expect(resultText).toBeVisible();
    await expect(resultText).toHaveAttribute('field', 'title');
    await expect(resultText).toHaveAttribute('default', 'no-title');
  });
});
