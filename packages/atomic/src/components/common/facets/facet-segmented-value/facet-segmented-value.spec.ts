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
    const element = await renderFunctionFixture(
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

    return {
      element,
      button: page.getByRole('button', {name: /Test Value/i}),
      valueLabel: element.querySelector('[part="value-label"]') as HTMLElement,
      valueCount: element.querySelector('[part="value-count"]') as HTMLElement,
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
      expect(valueLabel?.textContent?.trim()).toBe('My Value');
    });

    it('should display the compact count in parentheses', async () => {
      const {valueCount} = await renderSegmentedValue({numberOfResults: 1500});
      expect(valueCount?.textContent).toContain('1.5K');
    });

    it('should set the title attribute on the value label', async () => {
      const {valueLabel} = await renderSegmentedValue({
        displayValue: 'Test Value',
      });
      expect(valueLabel?.getAttribute('title')).toBe('Test Value');
    });

    it('should set the title attribute on the value count', async () => {
      const {valueCount} = await renderSegmentedValue({numberOfResults: 42});
      expect(valueCount?.getAttribute('title')).toBe('42');
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
    it('should have a descriptive aria-label', async () => {
      const {button} = await renderSegmentedValue({
        displayValue: 'Category A',
        numberOfResults: 100,
      });
      await expect(button).toHaveAccessibleName(/Category A/);
    });

    it('should use the localized count in aria-label', async () => {
      const {button} = await renderSegmentedValue({
        displayValue: 'Test',
        numberOfResults: 1000,
      });
      await expect(button).toHaveAccessibleName(/1,000/);
    });
  });

  describe('i18n', () => {
    it('should format the count with locale-specific formatting', async () => {
      const {valueCount} = await renderSegmentedValue({numberOfResults: 1000});
      // The compact format for 1000 should be "1K"
      expect(valueCount?.textContent).toContain('1K');
    });

    it('should format large numbers compactly', async () => {
      const {valueCount} = await renderSegmentedValue({
        numberOfResults: 1500000,
      });
      // The compact format for 1,500,000 should be "1.5M"
      expect(valueCount?.textContent).toContain('1.5M');
    });
  });
});
