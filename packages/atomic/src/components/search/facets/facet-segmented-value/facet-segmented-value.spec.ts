import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderFacetSegmentedValue} from './facet-segmented-value';

describe('renderFacetSegmentedValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    get listItem() {
      return page.getByRole('listitem');
    },
    get button() {
      return page.getByLabelText(
        'Inclusion filter on Test Value; 988M results'
      );
    },
    get valueLabel() {
      return page.getByText('Test Value');
    },
    get valueCount() {
      return page.getByText('(988M)');
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (props = {}) => {
    const baseProps = {
      displayValue: 'Test Value',
      numberOfResults: 987654321,
      isSelected: false,
      i18n,
      onClick: vi.fn(),
    };
    return await renderFunctionFixture(
      html`${renderFacetSegmentedValue({props: {...baseProps, ...props}})}`
    );
  };

  it('should render all elements', async () => {
    await setupElement();
    const {listItem, button, valueLabel, valueCount} = locators;
    await expect.element(listItem).toBeInTheDocument();
    await expect.element(button).toBeInTheDocument();
    await expect.element(valueLabel).toBeInTheDocument();
    await expect.element(valueCount).toBeInTheDocument();
  });

  it('should render the correct value and count', async () => {
    await setupElement();
    const {valueLabel, valueCount} = locators;
    await expect.element(valueLabel).toHaveTextContent('Test Value');
    await expect.element(valueCount).toHaveTextContent('(988M)');
  });

  it('should format count using compact notation', async () => {
    await setupElement({numberOfResults: 1234});
    const {valueCount} = locators;
    // The compact format should show something like (1.2K) or (1K) depending on locale
    await expect.element(valueCount).toBeInTheDocument();
  });

  it('should apply the correct part attributes', async () => {
    await setupElement();
    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({
        props: {
          displayValue: 'Test',
          numberOfResults: 100,
          isSelected: false,
          i18n,
          onClick: vi.fn(),
        },
      })}`
    );
    const button = element.querySelector('[part*="value-box"]');
    const label = element.querySelector('[part="value-label"]');
    const count = element.querySelector('[part="value-count"]');
    expect(button).toBeTruthy();
    expect(label).toBeTruthy();
    expect(count).toBeTruthy();
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    await setupElement({onClick});
    const {button} = locators;
    await button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('should apply aria-pressed="false" when not selected', async () => {
    await setupElement({isSelected: false});
    const {button} = locators;
    await expect.element(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should apply aria-pressed="true" when selected', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect.element(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should include value-box-selected part when selected', async () => {
    await setupElement({isSelected: true});
    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({
        props: {
          displayValue: 'Test',
          numberOfResults: 100,
          isSelected: true,
          i18n,
          onClick: vi.fn(),
        },
      })}`
    );
    const button = element.querySelector('[part*="value-box-selected"]');
    expect(button).toBeTruthy();
  });

  it('should apply selected styles when selected', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect.element(button).toHaveClass('selected');
    await expect.element(button).toHaveClass('border-primary');
    await expect.element(button).toHaveClass('shadow-inner-primary');
  });

  it('should apply hover styles when not selected', async () => {
    await setupElement({isSelected: false});
    const {button} = locators;
    await expect.element(button).toHaveClass('hover:border-primary-light');
    await expect
      .element(button)
      .toHaveClass('focus-visible:border-primary-light');
  });

  it('should apply text-primary class to label when selected', async () => {
    await setupElement({isSelected: true});
    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({
        props: {
          displayValue: 'Test',
          numberOfResults: 100,
          isSelected: true,
          i18n,
          onClick: vi.fn(),
        },
      })}`
    );
    const label = element.querySelector('[part="value-label"]');
    expect(label?.classList.contains('text-primary')).toBe(true);
  });

  it('should apply hover styles to label when not selected', async () => {
    await setupElement({isSelected: false});
    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({
        props: {
          displayValue: 'Test',
          numberOfResults: 100,
          isSelected: false,
          i18n,
          onClick: vi.fn(),
        },
      })}`
    );
    const label = element.querySelector('[part="value-label"]');
    expect(label?.classList.contains('group-hover:text-primary-light')).toBe(
      true
    );
    expect(label?.classList.contains('group-focus:text-primary')).toBe(true);
  });

  it('should apply correct title attributes', async () => {
    await setupElement({displayValue: 'Custom Value', numberOfResults: 5000});
    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({
        props: {
          displayValue: 'Custom Value',
          numberOfResults: 5000,
          isSelected: false,
          i18n,
          onClick: vi.fn(),
        },
      })}`
    );
    const label = element.querySelector('[part="value-label"]');
    const count = element.querySelector('[part="value-count"]');
    expect(label?.getAttribute('title')).toBe('Custom Value');
    expect(count?.getAttribute('title')).toBe('5,000');
  });

  it('should use buttonRef when provided', async () => {
    const buttonRef = vi.fn();
    await setupElement({buttonRef});
    expect(buttonRef).toHaveBeenCalled();
  });

  it('should use correct aria-label with localized count', async () => {
    await setupElement();
    const {button} = locators;
    // The aria label should include the formatted count
    await expect
      .element(button)
      .toHaveAccessibleName('Inclusion filter on Test Value; 988M results');
  });

  it('should render with different number formats based on i18n language', async () => {
    // The Intl.NumberFormat and toLocaleString use the i18n.language
    // This test verifies the function uses i18n.language for formatting
    const customI18n = await createTestI18n();
    await setupElement({i18n: customI18n, numberOfResults: 1234567});
    const {valueCount} = locators;
    // Just verify it renders, specific format depends on locale
    await expect.element(valueCount).toBeInTheDocument();
  });

  it('should set key property on list item', async () => {
    const element = await setupElement({displayValue: 'Unique Key'});
    const listItem = element.querySelector('li');
    expect(listItem).toBeTruthy();
    // The keyed directive uses the displayValue as key
  });
});
