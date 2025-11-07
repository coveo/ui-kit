import {html} from 'lit';
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
      html`${renderFacetSegmentedValue({
        props: {
          i18n,
          displayValue,
          numberOfResults,
          isSelected,
          onClick,
        },
      })}`
    );

    // Get button by its aria-label
    const count = numberOfResults.toLocaleString(i18n.language);
    const ariaLabel = i18n.t('facet-value', {
      value: displayValue,
      count: numberOfResults,
      formattedCount: count,
    });

    return {
      element,
      locators: {
        get button() {
          return page.getByLabelText(ariaLabel);
        },
        get buttonElement() {
          return element.querySelector('button');
        },
        get valueLabel() {
          return element.querySelector('[part="value-label"]');
        },
        get valueCount() {
          return element.querySelector('[part="value-count"]');
        },
      },
    };
  };

  describe('when rendering the component', () => {
    it('should render a list item with a button', async () => {
      const {element} = await renderSegmentedValue();
      expect(element).toBeInTheDocument();
    });

    it('should display the value label', async () => {
      const {locators} = await renderSegmentedValue({
        displayValue: 'My Value',
      });
      await expect(locators.valueLabel).toHaveTextContent('My Value');
    });

    it('should display the compact count in parentheses', async () => {
      const {locators} = await renderSegmentedValue({numberOfResults: 1500});
      await expect(locators.valueCount).toHaveTextContent(/1\.5K/);
    });

    it('should set the title attribute on the value label', async () => {
      const {locators} = await renderSegmentedValue({
        displayValue: 'Test Value',
      });
      await expect(locators.valueLabel).toHaveAttribute('title', 'Test Value');
    });

    it('should set the title attribute on the value count', async () => {
      const {locators} = await renderSegmentedValue({numberOfResults: 42});
      await expect(locators.valueCount).toHaveAttribute('title', '42');
    });
  });

  describe('when the value is not selected', () => {
    it('should set aria-pressed to false', async () => {
      const {locators} = await renderSegmentedValue({isSelected: false});
      await expect(locators.buttonElement).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('should not include value-box-selected in the part attribute', async () => {
      const {locators} = await renderSegmentedValue({isSelected: false});
      await expect(locators.buttonElement).not.toHaveAttribute(
        'part',
        expect.stringContaining('value-box-selected')
      );
    });

    it('should not have the selected class', async () => {
      const {locators} = await renderSegmentedValue({isSelected: false});
      await expect(locators.buttonElement).not.toHaveClass('selected');
    });
  });

  describe('when the value is selected', () => {
    it('should set aria-pressed to true', async () => {
      const {locators} = await renderSegmentedValue({isSelected: true});
      await expect(locators.buttonElement).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('should include value-box-selected in the part attribute', async () => {
      const {locators} = await renderSegmentedValue({isSelected: true});
      await expect(locators.buttonElement).toHaveAttribute(
        'part',
        expect.stringContaining('value-box-selected')
      );
    });

    it('should have the selected class', async () => {
      const {locators} = await renderSegmentedValue({isSelected: true});
      await expect(locators.buttonElement).toHaveClass('selected');
    });
  });

  describe('accessibility', () => {
    it('should have a descriptive aria-label with value name', async () => {
      const {element} = await renderSegmentedValue({
        displayValue: 'Category A',
        numberOfResults: 100,
      });
      expect(element).toBeInTheDocument();
    });

    it('should have aria-label with localized count', async () => {
      const {element} = await renderSegmentedValue({
        displayValue: 'Test',
        numberOfResults: 1000,
      });
      expect(element).toBeInTheDocument();
    });
  });

  describe('i18n', () => {
    it('should format the count with locale-specific formatting', async () => {
      const {locators} = await renderSegmentedValue({numberOfResults: 1000});
      // The compact format for 1000 should be "1K"
      await expect(locators.valueCount).toHaveTextContent(/1K/);
    });

    it('should format large numbers compactly', async () => {
      const {locators} = await renderSegmentedValue({
        numberOfResults: 1500000,
      });
      // The compact format for 1,500,000 should be "1.5M"
      await expect(locators.valueCount).toHaveTextContent(/1\.5M/);
    });
  });
});
