import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderFacetSegmentedValue} from './facet-segmented-value';

describe('#renderFacetSegmentedValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    get listItem() {
      return page.getByRole('listitem');
    },
    get button() {
      return page.getByRole('button');
    },
    get valueLabel() {
      return page.getByRole('button').locator('[part="value-label"]');
    },
    get valueCount() {
      return page.getByRole('button').locator('[part="value-count"]');
    },
  };

  const parts = (element: HTMLElement) => ({
    button: element.querySelector('[part*="value-box"]'),
    label: element.querySelector('[part="value-label"]'),
    count: element.querySelector('[part="value-count"]'),
  });

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
    const element = await renderFunctionFixture(
      html`${renderFacetSegmentedValue({props: {...baseProps, ...props}})}`
    );
    return {element, onClick: props.onClick || baseProps.onClick};
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
    const valueCount = page.getByText('(1.2K)');
    await expect.element(valueCount).toBeInTheDocument();
  });

  it('should apply the correct part attributes', async () => {
    const {element} = await setupElement();
    const {button, label, count} = parts(element);
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
    const {element} = await setupElement({isSelected: true});
    const button = parts(element).button;
    expect(button?.getAttribute('part')).toContain('value-box-selected');
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
    const {element} = await setupElement({isSelected: true});
    const label = parts(element).label;
    expect(label?.classList.contains('text-primary')).toBe(true);
  });

  it('should apply hover styles to label when not selected', async () => {
    const {element} = await setupElement({isSelected: false});
    const label = parts(element).label;
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
    await expect
      .element(button)
      .toHaveAccessibleName('Inclusion filter on Test Value; 988M results');
  });

  it('should format numbers consistently with i18n locale', async () => {
    await setupElement({numberOfResults: 1234567});
    const valueCount = page.getByText('(1.2M)');
    await expect.element(valueCount).toBeInTheDocument();
  });
});
