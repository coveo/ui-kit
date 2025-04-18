/* eslint-disable jest/no-identical-title */
import {testInsight, expect} from './fixture';

const exampleTitle = 'Test result';
const exampleUrl = 'https://test.com';
const copyToClipboardActionCause = 'copyToClipboard';

let test = testInsight;
test.describe(`quantic result copy to clipboard`, () => {
  test.describe('with the default options', () => {
    test('should correctly copy the result to clipboard and send the copyToClipboard analytics event', async ({
      resultCopyToClipboard,
      page,
    }) => {
      const copyToClipboardButton = resultCopyToClipboard.copyToClipboardButton;
      await expect(copyToClipboardButton).toBeVisible();
      await expect(copyToClipboardButton).not.toBeDisabled();

      // Hack: to have the request payload in the analytics request next. (Sendbeacon issue)
      await page.route('*analytics*', (route) => {
        route.continue();
      });

      const uaRequest = resultCopyToClipboard.waitForCopyToClipboardClickEvent(
        copyToClipboardActionCause
      );

      await copyToClipboardButton.click();

      await uaRequest;

      const clipboardText = await resultCopyToClipboard.page.evaluate(
        'navigator.clipboard.readText()'
      );
      const formattedCopiedContent = `${exampleTitle}\n${exampleUrl}`;

      expect(clipboardText).toEqual(formattedCopiedContent);
    });
  });
});
