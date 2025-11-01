import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type FacetSearchInputProps,
  renderFacetSearchInput,
} from './facet-search-input';

describe('renderFacetSearchInput', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let onClear: ReturnType<typeof vi.fn>;
  let onChange: ReturnType<typeof vi.fn>;

  let defaultProps: FacetSearchInputProps;

  const renderComponent = (props: Partial<FacetSearchInputProps> = {}) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderFacetSearchInput({props: mergedProps})}`
    );
  };

  const locators = {
    get input() {
      return page.getByLabelText('Search for values in the label facet');
    },
    get clearButton() {
      return page.getByRole('button');
    },
    get clearButtonIcon() {
      return locators.clearButton
        .element()
        .querySelector('[part="search-clear-button"]')! as HTMLElement;
    },
    searchIcon(element: HTMLElement) {
      return element.querySelector('[part="search-icon"]')! as HTMLElement;
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    onClear = vi.fn();
    onChange = vi.fn();
    defaultProps = {
      label: 'label',
      query: 'foo',
      i18n,
      onClear,
      onChange,
    };
  });

  it('should have a search-wrapper part attribute', async () => {
    const el = await renderComponent();
    expect(el.querySelector('[part="search-wrapper"]')).toBeInTheDocument();
  });

  it('should render the input with correct attributes and value', async () => {
    await renderComponent();
    expect(locators.input).toBeInTheDocument();
    expect(locators.input).toHaveValue('foo');
    expect(locators.input).toHaveAttribute('placeholder', 'Search');
    expect(locators.input).toHaveAttribute('part', 'search-input');
  });

  it('should call onChange when input value changes', async () => {
    await renderComponent();
    await locators.input.fill('bar');
    expect(onChange).toHaveBeenCalledWith('bar');
  });

  it('should not render the clear button when query is not empty', async () => {
    await renderComponent({
      query: '',
    });
    await expect.element(locators.clearButton).not.toBeInTheDocument();
  });

  it('should render the clear button when query is not empty', async () => {
    await renderComponent({
      query: 'foo',
    });
    await expect.element(locators.clearButton).toBeInTheDocument();
    await expect.element(locators.clearButtonIcon).toBeInTheDocument();
  });

  it('should call #onClear when clear button is clicked', async () => {
    await renderComponent();
    await userEvent.click(locators.clearButton.element());
    expect(onClear).toHaveBeenCalled();
  });

  it('should render the search icon and clear icon', async () => {
    const el = await renderComponent();
    const searchIcon = locators.searchIcon(el);

    await expect(
      locators.clearButtonIcon.getAttribute('icon')
    ).toMatchSnapshot();
    await expect(searchIcon.getAttribute('icon')).toMatchSnapshot();
  });
});
