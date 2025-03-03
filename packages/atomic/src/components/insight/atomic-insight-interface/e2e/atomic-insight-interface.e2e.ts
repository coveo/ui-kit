import {test, expect} from './fixture';

const defaultInsightQuerySummaryText = 'Insights related to this case';

test.describe('Atomic Insight Panel', () => {
  test.beforeEach(async ({insightInterface}) => {
    await insightInterface.load();
    await insightInterface.hydrated.waitFor();
  });

  test('should load correctly', async ({insightInterface}) => {
    await expect(insightInterface.insightInterface).toHaveClass('hydrated');
  });

  test.describe('components basics', () => {
    test('parts should load correctly', async ({insightInterface}) => {
      expect(await insightInterface.insightTabs.count()).toBeGreaterThan(0);

      await expect(insightInterface.insightQuerySummary).toBeVisible();
      await expect(insightInterface.insightQuerySummary).toHaveText(
        defaultInsightQuerySummaryText
      );

      await expect(insightInterface.insightSearchBox).toBeVisible();
      await expect(
        insightInterface.insightSearchBox.locator('textarea')
      ).toBeEditable();

      await expect(insightInterface.insightRefineToggle).toBeVisible();

      await expect(insightInterface.insightUserActionsToggle).toBeVisible();

      await expect(insightInterface.insightPager).toBeVisible();
      expect(
        await insightInterface.insightPagerButtons.count()
      ).toBeGreaterThan(0);

      expect(await insightInterface.insightResults.count()).toBeGreaterThan(0);
    });
  });

  test.describe('result actions interactions', () => {
    test.beforeEach(async ({insightInterface}) => {
      // Video results have better actions to test
      await insightInterface.getTabByName('Videos').click();
    });

    test('attach to case', async ({insightInterface}) => {
      await expect(insightInterface.getTabByName('Videos')).toHaveAttribute(
        'active'
      );
      await insightInterface.hoverResultByIndex(0);
      await expect(insightInterface.getActionBarByIndex(0)).toBeVisible();
      await expect(
        insightInterface.getResultAttachToCaseByIndex(0)
      ).toBeVisible();
      // No further tests because the Attach to case action does nothing in Atomic by default.
    });

    test('copy to clipboard', async ({insightInterface}) => {
      await expect(insightInterface.getTabByName('Videos')).toHaveAttribute(
        'active'
      );
      await insightInterface.hoverResultByIndex(0);
      await expect(insightInterface.getActionBarByIndex(0)).toBeVisible();
      await expect(
        insightInterface.getResultCopyToClipboardByIndex(0)
      ).toBeVisible();
      // No further tests because the copy to clipboard action does nothing in Atomic by default.
    });

    test('quickview', async ({insightInterface}) => {
      await expect(insightInterface.getTabByName('Videos')).toHaveAttribute(
        'active'
      );
      await insightInterface.hoverResultByIndex(0);
      await expect(insightInterface.getActionBarByIndex(0)).toBeVisible();
      await expect(insightInterface.getResultQuickviewByIndex(0)).toBeVisible();

      await insightInterface.openResultQuickviewByIndex(0);
      await expect(insightInterface.quickviewModal).not.toBeNull();
      await expect(insightInterface.atomicQuickviewModal).not.toBeNull();
      await expect(insightInterface.atomicQuickviewModal).toHaveAttribute(
        'is-open'
      );
      await expect(insightInterface.quickviewModalCloseButton).toBeVisible();
    });
  });

  test.describe('refine modal', () => {
    test('should open and close', async ({insightInterface}) => {
      await insightInterface.openRefineModal();
      await expect(insightInterface.insightRefineModal).not.toBeNull();
      await expect(insightInterface.insightRefineModal).toHaveAttribute(
        'is-open'
      );

      await expect(
        insightInterface.insightRefineModalCloseButton
      ).toBeVisible();
      await insightInterface.insightRefineModalCloseButton.click();
      await expect(insightInterface.insightRefineModal).not.toHaveAttribute(
        'is-open'
      );
    });
  });
});
