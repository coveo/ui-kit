import {expect, test} from './fixture';

test.describe('atomic-popover', () => {
  test.beforeEach(async ({popover}) => {
    await popover.load({story: 'default'});
    await popover.hydrated.waitFor();
  });

  test('should exist in DOM with correct attributes', async ({popover}) => {
    await expect(popover.hydrated).toBeAttached();
  });

  test('should display popover button with label', async ({popover}) => {
    await expect(popover.popoverButton).toBeVisible();
    await expect(popover.valueLabel).toBeVisible();
  });

  test('should toggle popover on button click', async ({popover}) => {
    // Initially closed
    await expect(popover.facetContainer).not.toBeVisible();

    // Click to open
    await popover.popoverButton.click();
    await expect(popover.facetContainer).toBeVisible();
    await expect(popover.backdrop).toBeVisible();

    // Click backdrop to close
    await popover.backdrop.click();
    await expect(popover.facetContainer).not.toBeVisible();
  });

  test('should close popover on Escape key', async ({popover}) => {
    // Open popover
    await popover.popoverButton.click();
    await expect(popover.facetContainer).toBeVisible();

    // Press Escape
    await popover.page.keyboard.press('Escape');
    await expect(popover.facetContainer).not.toBeVisible();
  });

  test('should have proper ARIA attributes', async ({popover}) => {
    // Check button has aria-expanded
    await expect(popover.popoverButton).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    // Open popover
    await popover.popoverButton.click();
    await expect(popover.popoverButton).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({popover}) => {
    await popover.load({story: 'default'});
    await popover.hydrated.waitFor();

    const screenshot = await popover.captureScreenshot();
    expect(screenshot).toMatchSnapshot('popover-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('should match baseline when opened', async ({popover}) => {
    await popover.load({story: 'default'});
    await popover.hydrated.waitFor();

    // Open the popover
    await popover.popoverButton.click();
    await popover.page.waitForTimeout(300);

    const screenshot = await popover.captureScreenshot();
    expect(screenshot).toMatchSnapshot('popover-opened.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
