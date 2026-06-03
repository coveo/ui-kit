import {expect, test} from './fixture';

test.describe('atomic-insight-result-action-bar', () => {
  test('should render action buttons when populated', async ({actionBar}) => {
    await actionBar.load({story: 'default'});

    await expect(actionBar.result).toBeVisible();
    await expect(actionBar.buttons).toHaveCount(2);
  });

  test('should become visible when hovering over result', async ({
    actionBar,
  }) => {
    await actionBar.load({story: 'default'});

    await expect(actionBar.result).toBeVisible();

    const bar = actionBar.actionBar;
    await expect(bar).toHaveCSS('visibility', 'hidden');

    await actionBar.result.hover();

    await expect(bar).toHaveCSS('visibility', 'visible');
  });
});
