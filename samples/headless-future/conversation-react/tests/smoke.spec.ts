import {expect, test} from '@playwright/test';

test.describe('smoke test', () => {
  test('loads the sample shell and configured metadata', async ({page}) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {name: 'Headless Future Conversation Sample'})
    ).toBeVisible();
    await expect(page.getByText('organizationId: e2e-org')).toBeVisible();
    await expect(page.getByText('trackingId: e2e-tracking-id')).toBeVisible();
  });
});
