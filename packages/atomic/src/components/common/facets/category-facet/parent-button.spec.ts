import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type CategoryFacetParentButtonProps,
  renderCategoryFacetParentButton,
} from './parent-button';

vi.mock('@/src/utils/field-utils', () => ({
  getFieldValueCaption: vi.fn(
    (field: string, value: string) => `${field}: ${value}`
  ),
}));

describe('#renderCategoryFacetParentButton', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<CategoryFacetParentButtonProps> = {}
  ) => {
    const defaultProps: CategoryFacetParentButtonProps = {
      i18n,
      field: 'category',
      facetValue: {value: 'electronics', numberOfResults: 42},
      onClick: vi.fn(),
    };
    const mergedProps = {...defaultProps, ...props};
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetParentButton({props: mergedProps})}`
    );

    return {
      container,
      get button() {
        return container.querySelector('button');
      },
      get icon() {
        return container.querySelector('atomic-icon');
      },
      get textSpan() {
        return container.querySelector('span.truncate');
      },
    };
  };

  it('should render a button with correct structure', async () => {
    const {button} = await renderComponent();

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('part', 'parent-button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render the back arrow icon', async () => {
    const {icon} = await renderComponent();

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('part', 'back-arrow');
  });

  it('should render the display value with correct formatting', async () => {
    const {textSpan} = await renderComponent();

    expect(textSpan).toBeInTheDocument();
    expect(textSpan).toHaveTextContent('category: electronics');
  });

  it('should call onClick when button is clicked', async () => {
    const onClickMock = vi.fn();
    const {button} = await renderComponent({onClick: onClickMock});

    button?.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should generate correct aria-label', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute(
      'aria-label',
      'Inclusion filter on category: electronics; 42 results'
    );
  });

  it('should handle different field and facet values', async () => {
    const {textSpan, button} = await renderComponent({
      field: 'brand',
      facetValue: {value: 'apple', numberOfResults: 123},
    });

    expect(textSpan).toHaveTextContent('brand: apple');
    expect(button).toHaveAttribute(
      'aria-label',
      'Inclusion filter on brand: apple; 123 results'
    );
  });

  it('should format large numbers correctly in aria-label', async () => {
    const {button} = await renderComponent({
      facetValue: {value: 'test', numberOfResults: 1234},
    });

    expect(button).toHaveAttribute(
      'aria-label',
      'Inclusion filter on category: test; 1,234 results'
    );
  });

  it('should apply the correct button style', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveClass('btn-text-neutral');
  });
});
