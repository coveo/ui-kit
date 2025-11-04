import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
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

  it('renders all elements', async () => {
    const {listItem, label, valueCount, checkbox} = await setupElement();
    expect(listItem).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(valueCount).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();
  });

  it('renders correctly with valid parts', async () => {
    const {label, valueCount, checkbox} = await setupElement();

    expect(label).toHaveAttribute('part', 'value-checkbox-label');
    expect(valueCount).toHaveAttribute('part', 'value-count');
    expect(checkbox.element()).toHaveAttribute(
      'part',
      expect.stringContaining('value-checkbox')
    );
  });

  it('applies the correct part value based on display value', async () => {
    const {checkbox} = await setupElement({displayValue: 'TestColor'});

    expect(checkbox.element()).toHaveAttribute(
      'part',
      expect.stringContaining('value-TestColor')
    );
  });

  it('adds checked part when selected', async () => {
    const {checkbox} = await setupElement({isSelected: true});

    expect(checkbox.element()).toHaveAttribute(
      'part',
      expect.stringContaining('value-checkbox-checked')
    );
  });

  it('does not add checked part when not selected', async () => {
    const {checkbox} = await setupElement({isSelected: false});

    expect(checkbox.element()).not.toHaveAttribute(
      'part',
      expect.stringContaining('value-checkbox-checked')
    );
  });

  it('applies ring-primary class when selected', async () => {
    const {checkbox} = await setupElement({isSelected: true});

    expect(checkbox.element()).toHaveClass('ring-primary');
  });

  it('does not apply ring-primary class when not selected', async () => {
    const {checkbox} = await setupElement({isSelected: false});

    expect(checkbox.element()).not.toHaveClass('ring-primary');
  });

  it('calls onClick when checkbox is clicked', async () => {
    const onClick = vi.fn();

    const {checkbox} = await setupElement({onClick});

    checkbox.element().dispatchEvent(new MouseEvent('click'));

    expect(onClick).toHaveBeenCalled();
  });

  it('calls createRipple when checkbox is clicked with mousedown', async () => {
    const createRippleSpy = vi.mocked(createRipple);

    const {checkbox} = await setupElement();

    checkbox.element().dispatchEvent(new MouseEvent('mousedown'));

    expect(createRippleSpy).toHaveBeenCalled();
  });

  it('calls createRipple when label is clicked with mousedown', async () => {
    const createRippleSpy = vi.mocked(createRipple);

    const {label} = await setupElement();

    label.element().dispatchEvent(new MouseEvent('mousedown'));

    expect(createRippleSpy).toHaveBeenCalled();
  });

  it('sets aria-checked to "true" when selected', async () => {
    const {checkbox} = await setupElement({isSelected: true});

    expect(checkbox.element()).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to "false" when not selected', async () => {
    const {checkbox} = await setupElement({isSelected: false});

    expect(checkbox.element()).toHaveAttribute('aria-checked', 'false');
  });

  it('formats the count according to locale', async () => {
    const {valueCount} = await setupElement({numberOfResults: 1000});

    expect(valueCount).toBeInTheDocument();
  });

  it('renders children inside the label', async () => {
    await setupElement({});
    const child = page.getByText('Some Value Label');
    expect(child).toBeInTheDocument();
  });

  it('renders custom children inside the label', async () => {
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
});
