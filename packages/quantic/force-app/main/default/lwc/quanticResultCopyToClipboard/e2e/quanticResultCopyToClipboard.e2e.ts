/* eslint-disable jest/no-identical-title */
import {testInsight, expect} from './fixture';

const exampleTitle = 'Test result';
const exampleUrl = 'https://test.com';
const defaultLabel = 'Copy';
const customLabel = 'Custom title';
const defaultSuccessLabel = 'Copied!';
const customSuccessLabel = 'Youpi!';

let test = testInsight;
test.describe(`quantic result copy to clipboard`, () => {
  test.describe('with the default options', () => {
    test('should correctly copy the result to clipboard and send the copyToClipboard analytics event', async ({
      resultCopyToClipboard,
    }) => {
      const copyToClipboardButton = resultCopyToClipboard.copyToClipboardButton;
      await expect(copyToClipboardButton).toBeVisible();
      await expect(copyToClipboardButton).not.toBeDisabled();

      await copyToClipboardButton.hover();
      const copyToClipboardTooltip =
        resultCopyToClipboard.copyToClipboardTooltip;
      await expect(copyToClipboardTooltip).toBeVisible();
      await expect(copyToClipboardTooltip).toHaveText(defaultLabel);

      const uaRequest =
        resultCopyToClipboard.waitForCopyToClipboardClickEvent();

      await copyToClipboardButton.click();

      await expect(copyToClipboardTooltip).toHaveText(defaultSuccessLabel);
      await uaRequest;

      const clipboardText = await resultCopyToClipboard.page.evaluate(
        'navigator.clipboard.readText()'
      );
      const formattedCopiedContent = `${exampleTitle}\n${exampleUrl}`;

      expect(clipboardText).toEqual(formattedCopiedContent);
    });
  });

  test.describe('with custom options', () => {
    test.use({
      options: {
        label: customLabel,
        successLabel: customSuccessLabel,
      },
    });
    test('should correctly copy the result to clipboard and send the copyToClipboard analytics event', async ({
      resultCopyToClipboard,
    }) => {
      const copyToClipboardButton = resultCopyToClipboard.copyToClipboardButton;
      await expect(copyToClipboardButton).toBeVisible();
      await expect(copyToClipboardButton).not.toBeDisabled();

      await copyToClipboardButton.hover();
      const copyToClipboardTooltip =
        resultCopyToClipboard.copyToClipboardTooltip;
      await expect(copyToClipboardTooltip).toBeVisible();
      await expect(copyToClipboardTooltip).toHaveText(customLabel);

      const uaRequest =
        resultCopyToClipboard.waitForCopyToClipboardClickEvent();

      await copyToClipboardButton.click();

      await expect(copyToClipboardTooltip).toHaveText(customSuccessLabel);
      await uaRequest;

      const clipboardText = await resultCopyToClipboard.page.evaluate(
        'navigator.clipboard.readText()'
      );
      const formattedCopiedContent = `${exampleTitle}\n${exampleUrl}`;

      expect(clipboardText).toEqual(formattedCopiedContent);
    });
  });
});
