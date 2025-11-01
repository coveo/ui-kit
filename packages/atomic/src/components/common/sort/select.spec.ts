import {html, type TemplateResult} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderSortSelect, type SortSelectProps} from './select';

describe('#renderSortSelect', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  const locators = {
    get select() {
      return page.getByRole('combobox');
    },
    get option() {
      return page.getByRole('option');
    },
    selectParent(element: Element) {
      return element.querySelector('[part="select-parent"]')!;
    },
    separator(element: Element) {
      return element.querySelector('[part="select-separator"]')!;
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (
    children: TemplateResult,
    props?: Partial<SortSelectProps>
  ) => {
    return await renderFunctionFixture(
      html`${renderSortSelect({
        props: {
          i18n,
          id: props?.id || 'sort-select',
          onSelect: props?.onSelect || vi.fn(),
        },
      })(children)}`
    );
  };

  it('renders correctly with valid props', async () => {
    const element = await setupElement(html`<option value="foo">Foo</option>`);

    const separator = () => locators.separator(element);

    await expect
      .element(locators.select)
      .toHaveAttribute('aria-label', 'Sort by');
    await expect.element(locators.select).toHaveAttribute('id', 'sort-select');
    await expect.element(locators.option.getByText('Foo')).toBeInTheDocument();
    await expect.element(separator()).toBeInTheDocument();
  });

  it('calls onSelect when an option is selected', async () => {
    const onSelect = vi.fn();
    const element = await setupElement(html`<option value="foo">Foo</option>`, {
      onSelect,
    });

    const select = element.querySelector('select');
    select?.dispatchEvent(new Event('change'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('renders the dropdown icon correctly', async () => {
    const element = await setupElement(html`<option value="foo">Foo</option>`);

    const icon = element.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.getAttribute('icon')).toMatch(/<svg.*><\/svg>/);
  });

  it('applies the correct part attributes', async () => {
    const element = await setupElement(html`<option value="foo">Foo</option>`);

    const selectParent = () => locators.selectParent(element);
    const separator = () => locators.separator(element);

    await expect.element(selectParent()).toBeInTheDocument();
    await expect.element(separator()).toBeInTheDocument();
  });
});
