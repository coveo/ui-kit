import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {FacetValuePropsBase} from '@/src/components/common/facets/facet-common';
import {createRipple} from '@/src/utils/ripple-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderColorFacetCheckbox} from './color-facet-checkbox';

vi.mock('@/src/utils/ripple-utils', {spy: true});

describe('#renderColorFacetCheckbox', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (props?: Partial<FacetValuePropsBase>) => {
    const element = await renderFunctionFixture(
      html`${renderColorFacetCheckbox({
        props: {
          displayValue: 'Test Value',
          numberOfResults: 42,
          isSelected: false,
          i18n,
          onClick: vi.fn(),
          ...props,
        },
      })(html`Some Value Label`)}`
    );
    return {
      element,
      listItem: page.getByRole('listitem'),
      checkbox: page.getByRole('checkbox'),
      label: page.getByText('Some Value Label'),
      valueCount: page.getByText('42'),
    };
  };

  it('should render all elements', async () => {
    const {listItem, label, valueCount, checkbox} = await setupElement();
    expect(listItem).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(valueCount).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();
  });

  it('should render correctly with valid parts', async () => {
    const {label, valueCount, checkbox} = await setupElement();

    expect(label).toHaveAttribute('part', 'value-checkbox-label');
    expect(valueCount).toHaveAttribute('part', 'value-count');
    expect(checkbox.element()).toHaveAttribute(
      'part',
      expect.stringContaining('value-checkbox')
    );
  });

  it('should apply the correct part value based on display value', async () => {
    const {checkbox} = await setupElement({displayValue: 'TestColor'});

    expect(checkbox.element()).toHaveAttribute(
      'part',
      expect.stringContaining('value-TestColor')
    );
  });

  it('should add checked part when selected', async () => {
    const {checkbox} = await setupElement({isSelected: true});

    expect(checkbox.element()).toHaveAttribute(
      'part',
      expect.stringContaining('value-checkbox-checked')
    );
  });

  it('should not add checked part when not selected', async () => {
    const {checkbox} = await setupElement({isSelected: false});

    expect(checkbox.element()).not.toHaveAttribute(
      'part',
      expect.stringContaining('value-checkbox-checked')
    );
  });

  it('should apply ring-primary class when selected', async () => {
    const {checkbox} = await setupElement({isSelected: true});

    expect(checkbox.element()).toHaveClass('ring-primary');
  });

  it('should not apply ring-primary class when not selected', async () => {
    const {checkbox} = await setupElement({isSelected: false});

    expect(checkbox.element()).not.toHaveClass('ring-primary');
  });

  it('should call onClick when checkbox is clicked', async () => {
    const onClick = vi.fn();

    const {checkbox} = await setupElement({onClick});

    (checkbox.element() as HTMLElement).click();

    expect(onClick).toHaveBeenCalled();
  });

  it('should call createRipple when checkbox is clicked with mousedown', async () => {
    const createRippleSpy = vi.mocked(createRipple);

    const {checkbox} = await setupElement();

    checkbox
      .element()
      .dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

    expect(createRippleSpy).toHaveBeenCalled();
  });

  it('should call createRipple when label is clicked with mousedown', async () => {
    const createRippleSpy = vi.mocked(createRipple);

    const {label} = await setupElement();

    label.element().dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

    expect(createRippleSpy).toHaveBeenCalled();
  });

  it('should set aria-checked to "true" when selected', async () => {
    const {checkbox} = await setupElement({isSelected: true});

    expect(checkbox.element()).toHaveAttribute('aria-checked', 'true');
  });

  it('should set aria-checked to "false" when not selected', async () => {
    const {checkbox} = await setupElement({isSelected: false});

    expect(checkbox.element()).toHaveAttribute('aria-checked', 'false');
  });

  it('should format the count according to locale', async () => {
    const {element} = await setupElement({numberOfResults: 1000});

    const valueCount = element.querySelector('[part="value-count"]');
    expect(valueCount).toBeInTheDocument();
    expect(valueCount?.textContent).toBeTruthy();
  });

  it('should render children inside the label', async () => {
    await setupElement({});
    const child = page.getByText('Some Value Label');
    expect(child).toBeInTheDocument();
  });

  it('should render custom children inside the label', async () => {
    await renderFunctionFixture(
      html`${renderColorFacetCheckbox({
        props: {
          displayValue: 'Test',
          numberOfResults: 5,
          isSelected: false,
          i18n,
          onClick: vi.fn(),
        },
      })(html`<span>Custom Label</span>`)}`
    );
    const child = page.getByText('Custom Label');
    expect(child).toBeInTheDocument();
  });

  it('should use "between-parentheses" translation for count display', async () => {
    const {element} = await setupElement({numberOfResults: 42});

    const valueCount = element.querySelector('[part="value-count"]');
    expect(valueCount?.textContent?.trim()).toBe('(42)');
  });

  it('should use "facet-value" translation for aria-label', async () => {
    const {checkbox} = await setupElement({
      displayValue: 'Test Value',
      numberOfResults: 42,
    });

    expect(checkbox.element()).toHaveAttribute(
      'aria-label',
      'Inclusion filter on Test Value; 42 results'
    );
  });
});
