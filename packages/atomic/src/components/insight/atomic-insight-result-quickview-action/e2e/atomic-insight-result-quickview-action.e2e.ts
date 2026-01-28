import {expect, test} from './fixture';

test.describe('Insight Result Quickview Action', () => {
  test.beforeEach(async ({insightResultQuickviewAction}) => {
    await insightResultQuickviewAction.load({
      args: {
        sandbox:
          'allow-scripts allow-popups allow-top-navigation allow-same-origin',
      },
    });
    await insightResultQuickviewAction.hydrated.waitFor();
  });

  test('should have clickable button', async ({
    insightResultQuickviewAction,
  }) => {
    await expect(insightResultQuickviewAction.resultButton).toBeVisible();
    await expect(insightResultQuickviewAction.resultButton).toBeEnabled();
  });

  test('should open modal when button is clicked', async ({
    insightResultQuickviewAction,
  }) => {
    await insightResultQuickviewAction.resultButton.click();
    await expect(insightResultQuickviewAction.modal).toBeVisible();
  });

  test('should meet accessibility standards', async ({makeAxeBuilder}) => {
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
