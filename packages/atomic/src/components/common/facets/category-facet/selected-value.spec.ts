import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type CategoryFacetSelectedValueProps,
  renderCategoryFacetSelectedValue,
} from './selected-value';

describe('#renderCategoryFacetSelectedValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (props: Partial<CategoryFacetSelectedValueProps> = {}) => {
    const defaultProps: CategoryFacetSelectedValueProps = {
      displayValue: 'United States',
      label: 'Geographical Hierarchy',
      i18n,
      onClearFilters: vi.fn(),
    };
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetSelectedValue({props: {...defaultProps, ...props}})}`
    );

    return {
      container,
      pill: container.querySelector('[part="selected-value-pill"]'),
      clearButton: container.querySelector<HTMLButtonElement>(
        '[part="selected-value-clear-button"]'
      ),
    };
  };

  it('should render the selected value in a pill', async () => {
    const {pill} = await renderComponent();

    expect(pill).toHaveTextContent('United States');
  });

  it('should title the pill so a truncated value stays readable', async () => {
    const {pill} = await renderComponent({displayValue: 'A very long category value'});

    expect(pill).toHaveAttribute('title', 'A very long category value');
  });

  it('should not make the pill interactive', async () => {
    const {pill} = await renderComponent();

    expect(pill?.tagName).toBe('SPAN');
  });

  it('should render a clear button', async () => {
    const {clearButton} = await renderComponent();

    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveTextContent('Clear');
  });

  it('should describe the clear button with the facet label', async () => {
    const {clearButton} = await renderComponent();

    expect(clearButton).toHaveAttribute(
      'aria-label',
      'Clear 1 filter for the Geographical Hierarchy facet'
    );
  });

  it('should call onClearFilters when the clear button is clicked', async () => {
    const onClearFilters = vi.fn();
    const {clearButton} = await renderComponent({onClearFilters});

    clearButton?.click();

    expect(onClearFilters).toHaveBeenCalledOnce();
  });
});
