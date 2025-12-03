import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderFacetSegmentedValue} from './facet-segmented-value';

describe('renderFacetSegmentedValue', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: {
      displayValue?: string;
      numberOfResults?: number;
      isSelected?: boolean;
      onClick?: () => void;
    } = {}
  ) => {
    const defaultProps = {
      displayValue: 'Test Value',
      numberOfResults: 10,
      isSelected: false,
      i18n,
      onClick: overrides.onClick ?? vi.fn(),
    };

    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({
        props: {...defaultProps, ...overrides},
      })}`
    );

    return {
      element,
      listItem: element.querySelector('li'),
      button: element.querySelector('button'),
      valueLabel: element.querySelector('[part="value-label"]'),
      valueCount: element.querySelector('[part="value-count"]'),
    };
  };

  describe('#render', () => {
    it('should render a list item', async () => {
      const {listItem} = await renderComponent();

      expect(listItem).not.toBeNull();
    });

    it('should render a button', async () => {
      const {button} = await renderComponent();

      expect(button).not.toBeNull();
    });

    it('should render the display value', async () => {
      const {valueLabel} = await renderComponent({displayValue: 'My Facet'});

      expect(valueLabel?.textContent).toBe('My Facet');
    });

    it('should render the result count', async () => {
      const {valueCount} = await renderComponent({numberOfResults: 42});

      expect(valueCount?.textContent).toContain('42');
    });

    it('should set aria-pressed to false when not selected', async () => {
      const {button} = await renderComponent({isSelected: false});

      expect(button?.getAttribute('aria-pressed')).toBe('false');
    });

    it('should set aria-pressed to true when selected', async () => {
      const {button} = await renderComponent({isSelected: true});

      expect(button?.getAttribute('aria-pressed')).toBe('true');
    });

    it('should add value-box part to button', async () => {
      const {button} = await renderComponent({isSelected: false});

      expect(button?.getAttribute('part')).toContain('value-box');
    });

    it('should add value-box-selected part when selected', async () => {
      const {button} = await renderComponent({isSelected: true});

      expect(button?.getAttribute('part')).toContain('value-box-selected');
    });

    it('should call onClick when button is clicked', async () => {
      const onClick = vi.fn();
      const {button} = await renderComponent({onClick});

      button?.click();

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('styling classes', () => {
    it('should apply selected styling when selected', async () => {
      const {button} = await renderComponent({isSelected: true});

      expect(button?.className).toContain('selected');
    });

    it('should not apply selected styling when not selected', async () => {
      const {button} = await renderComponent({isSelected: false});

      expect(button?.className).not.toContain('selected');
    });
  });
});
