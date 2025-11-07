import {beforeAll, describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderFacetSegmentedValue} from './facet-segmented-value';

describe('renderFacetSegmentedValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderSegmentedValue = async ({
    displayValue = 'Test Value',
    numberOfResults = 42,
    isSelected = false,
    onClick = () => {},
  } = {}) => {
    await renderFunctionFixture(
      renderFacetSegmentedValue({
        props: {
          i18n,
          displayValue,
          numberOfResults,
          isSelected,
          onClick,
        },
      })
    );

    // Get button by its aria-label
    const count = numberOfResults.toLocaleString(i18n.language);
    const ariaLabel = i18n.t('facet-value', {
      value: displayValue,
      count: numberOfResults,
      formattedCount: count,
    });

    return {
      button: page.getByLabelText(ariaLabel),
      valueLabel: page.locator('[part="value-label"]'),
      valueCount: page.locator('[part="value-count"]'),
    };
  };

  describe('when rendering the component', () => {
    it('should render a list item with a button', async () => {
      const {button} = await renderSegmentedValue();
      expect(button).toBeInTheDocument();
    });

    it('should display the value label', async () => {
      const {valueLabel} = await renderSegmentedValue({
        displayValue: 'My Value',
      });
      await expect(valueLabel).toHaveTextContent('My Value');
    });

    it('should display the compact count in parentheses', async () => {
      const {valueCount} = await renderSegmentedValue({numberOfResults: 1500});
      await expect(valueCount).toHaveTextContent(/1\.5K/);
    });

    it('should set the title attribute on the value label', async () => {
      const {valueLabel} = await renderSegmentedValue({
        displayValue: 'Test Value',
      });
      await expect(valueLabel).toHaveAttribute('title', 'Test Value');
    });

    it('should set the title attribute on the value count', async () => {
      const {valueCount} = await renderSegmentedValue({numberOfResults: 42});
      await expect(valueCount).toHaveAttribute('title', '42');
    });
  });

  describe('when the value is not selected', () => {
    it('should set aria-pressed to false', async () => {
      const {button} = await renderSegmentedValue({isSelected: false});
      await expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should not include value-box-selected in the part attribute', async () => {
      const {button} = await renderSegmentedValue({isSelected: false});
      await expect(button).not.toHaveAttribute(
        'part',
        expect.stringContaining('value-box-selected')
      );
    });

    it('should not have the selected class', async () => {
      const {button} = await renderSegmentedValue({isSelected: false});
      await expect(button).not.toHaveClass('selected');
    });
  });

  describe('when the value is selected', () => {
    it('should set aria-pressed to true', async () => {
      const {button} = await renderSegmentedValue({isSelected: true});
      await expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should include value-box-selected in the part attribute', async () => {
      const {button} = await renderSegmentedValue({isSelected: true});
      await expect(button).toHaveAttribute(
        'part',
        expect.stringContaining('value-box-selected')
      );
    });

    it('should have the selected class', async () => {
      const {button} = await renderSegmentedValue({isSelected: true});
      await expect(button).toHaveClass('selected');
    });
  });

  describe('accessibility', () => {
    it('should have a descriptive aria-label with value name', async () => {
      const {button} = await renderSegmentedValue({
        displayValue: 'Category A',
        numberOfResults: 100,
      });
      expect(button).toBeInTheDocument();
    });

    it('should have aria-label with localized count', async () => {
      const {button} = await renderSegmentedValue({
        displayValue: 'Test',
        numberOfResults: 1000,
      });
      expect(button).toBeInTheDocument();
    });
  });

  describe('i18n', () => {
    it('should format the count with locale-specific formatting', async () => {
      const {valueCount} = await renderSegmentedValue({numberOfResults: 1000});
      // The compact format for 1000 should be "1K"
      await expect(valueCount).toHaveTextContent(/1K/);
    });

    it('should format large numbers compactly', async () => {
      const {valueCount} = await renderSegmentedValue({
        numberOfResults: 1500000,
      });
      // The compact format for 1,500,000 should be "1.5M"
      await expect(valueCount).toHaveTextContent(/1\.5M/);
    });
  });
});
