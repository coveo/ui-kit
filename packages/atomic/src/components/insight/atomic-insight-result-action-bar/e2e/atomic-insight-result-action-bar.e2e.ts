import {expect, test} from './fixture';

test.describe('atomic-insight-result-action-bar', () => {
  test('should render action buttons when populated', async ({actionBar}) => {
    await actionBar.load({story: 'default'});

    await expect(actionBar.result).toBeVisible();
    await expect(actionBar.buttons).toHaveCount(2);
  });

  test('should become visible when hovering over result', async ({actionBar}) => {
    await actionBar.load({story: 'default'});

    await expect(actionBar.result).toBeVisible();

    const bar = actionBar.actionBar;
    await expect(bar).toHaveCSS('opacity', '0');

    await actionBar.result.hover();

    await expect(bar).toHaveCSS('opacity', '1');
  });

  test.describe('when using the keyboard', () => {
    test.beforeEach(async ({actionBar}) => {
      await actionBar.load({story: 'with-copy-action'});
      await expect(actionBar.resultLink).toBeVisible();
      await expect(actionBar.actionBar).toHaveCSS('opacity', '0');
    });

    test('should become visible when focus moves into the result', async ({actionBar}) => {
      await actionBar.resultLink.focus();

      await expect(actionBar.actionBar).toHaveCSS('opacity', '1');
    });

    test('should let the user tab to an action and trigger it with Enter', async ({
      actionBar,
      page,
    }) => {
      await actionBar.resultLink.focus();
      await page.keyboard.press('Tab');

      await expect(actionBar.copyToClipboardButton).toBeFocused();
      await expect(actionBar.actionBar).toHaveCSS('opacity', '1');
      await expect(actionBar.copyToClipboardButton).toHaveAttribute('title', 'Copy to Clipboard');

      await page.keyboard.press('Enter');

      await expect(actionBar.copyToClipboardButton).toHaveAttribute('title', 'Copied!');
    });

    test('should hide again when focus leaves the result', async ({actionBar, page}) => {
      await actionBar.resultLink.focus();
      await page.keyboard.press('Tab');
      await expect(actionBar.copyToClipboardButton).toBeFocused();

      await page.keyboard.press('Tab');

      await expect(actionBar.copyToClipboardButton).not.toBeFocused();
      await expect(actionBar.actionBar).toHaveCSS('opacity', '0');
    });
  });
});
