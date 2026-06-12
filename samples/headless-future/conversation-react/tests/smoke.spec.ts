import {expect, test} from '@playwright/test';

test.describe('smoke test', () => {
  test('submits a turn and renders streamed response with debug events', async ({
    page,
  }) => {
    await page.route('**/commerce/unstable/agentic/converse', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        },
        body: [
          'event: turn_started',
          'data: {"conversationSessionId":"session-e2e","conversationToken":"token-e2e"}',
          '',
          'event: message',
          'data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":"Hello "}',
          '',
          'event: message',
          'data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":"from mocked stream"}',
          '',
          'event: turn_complete',
          'data: {}',
          '',
        ].join('\n'),
      });
    });

    await page.goto('/');

    await expect(
      page.getByRole('heading', {name: 'Headless Future Conversation Sample'})
    ).toBeVisible();
    await expect(page.getByText('organizationId: e2e-org')).toBeVisible();
    await expect(page.getByText('trackingId: e2e-tracking-id')).toBeVisible();

    await page.getByLabel('Message input').fill('hello from playwright');
    await page.getByLabel('Message input').press('Enter');

    await expect(page.getByText('hello from playwright')).toBeVisible();
    await expect(
      page
        .locator('section[aria-live="polite"]')
        .getByText('Hello from mocked stream')
    ).toBeVisible();

    const rawEventLog = page
      .locator('section')
      .filter({has: page.getByRole('heading', {name: 'Raw event log'})});

    await expect(rawEventLog.getByText('TEXT_MESSAGE_CONTENT')).toBeVisible();
    await expect(rawEventLog.getByText('completed')).toBeVisible();
  });
});
