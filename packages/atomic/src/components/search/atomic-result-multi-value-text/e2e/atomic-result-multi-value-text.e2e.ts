import {expect, test} from './fixture';

test.describe('atomic-result-multi-value-text', () => {
  test.describe('default', () => {
    test.beforeEach(async ({resultMultiValueText}) => {
      await resultMultiValueText.load({story: 'default'});
      await resultMultiValueText.hydrated.waitFor();
    });

    test('should render list of values', async ({resultMultiValueText}) => {
      await expect(resultMultiValueText.list).toBeVisible();
      await expect(resultMultiValueText.values).not.toHaveCount(0);
    });

    test('should render separators between values', async ({
      resultMultiValueText,
    }) => {
      const valueCount = await resultMultiValueText.values.count();
      const separatorCount = await resultMultiValueText.separators.count();

      // Should have at least one less separator than values (or more if "more" label is shown)
      expect(separatorCount).toBeGreaterThanOrEqual(valueCount - 1);
    });
  });

  test.describe('with max-values-to-display', () => {
    test.beforeEach(async ({resultMultiValueText}) => {
      await resultMultiValueText.load({
        story: 'default',
        args: {'max-values-to-display': 2},
      });
      await resultMultiValueText.hydrated.waitFor();
    });

    test('should limit number of displayed values', async ({
      resultMultiValueText,
    }) => {
      await expect(resultMultiValueText.values).toHaveCount(2);
    });

    test('should display "more" label when truncated', async ({
      resultMultiValueText,
    }) => {
      await expect(resultMultiValueText.moreLabel).toBeVisible();
      await expect(resultMultiValueText.moreLabel).toContainText('more');
    });
  });
});
