import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {vi, describe, it, expect} from 'vitest';
import {
  renderCategoryFacetParentButton,
  type CategoryFacetParentButtonProps,
} from './parent-button';

const mockI18n = {
  t: vi.fn((key: string, options?: unknown) => {
    if (key === 'facet-value') {
      const opts = options as {value: string; count: number};
      return `${opts?.value} (${opts?.count})`;
    }
    return key;
  }),
  language: 'en',
} as unknown as i18n;

vi.mock('../../../../utils/field-utils', () => ({
  getFieldValueCaption: vi.fn(
    (field: string, value: string) => `${field}: ${value}`
  ),
}));

describe('renderCategoryFacetParentButton', () => {
  const defaultProps: CategoryFacetParentButtonProps = {
    i18n: mockI18n,
    field: 'category',
    facetValue: {value: 'electronics', numberOfResults: 42},
    onClick: vi.fn(),
  };

  const renderComponent = (
    props: Partial<CategoryFacetParentButtonProps> = {}
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetParentButton({props: mergedProps})}`
    );
  };

  it('should render a button with correct structure', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('part', 'parent-button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render the back arrow icon', async () => {
    const container = await renderComponent();
    const icon = container.querySelector('atomic-icon');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('part', 'back-arrow');
  });

  it('should render the display value with correct formatting', async () => {
    const container = await renderComponent();
    const textSpan = container.querySelector('span.truncate');

    expect(textSpan).toBeInTheDocument();
    expect(textSpan).toHaveTextContent('category: electronics');
  });

  it('should call onClick when button is clicked', async () => {
    const onClickMock = vi.fn();
    const container = await renderComponent({onClick: onClickMock});
    const button = container.querySelector('button');

    button?.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should generate correct aria-label', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toHaveAttribute('aria-label', 'category: electronics (42)');
    expect(mockI18n.t).toHaveBeenCalledWith('facet-value', {
      value: 'category: electronics',
      count: 42,
      formattedCount: '42',
    });
  });

  it('should handle different field and facet values', async () => {
    const container = await renderComponent({
      field: 'brand',
      facetValue: {value: 'apple', numberOfResults: 123},
    });

    const textSpan = container.querySelector('span.truncate');
    const button = container.querySelector('button');

    expect(textSpan).toHaveTextContent('brand: apple');
    expect(button).toHaveAttribute('aria-label', 'brand: apple (123)');
  });

  it('should format large numbers correctly in aria-label', async () => {
    await renderComponent({
      facetValue: {value: 'test', numberOfResults: 1234},
    });

    expect(mockI18n.t).toHaveBeenCalledWith('facet-value', {
      value: 'category: test',
      count: 1234,
      formattedCount: '1,234',
    });
  });

  it('should apply the correct button style', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toHaveClass('btn-text-neutral');
  });

  it('should handle different i18n languages', async () => {
    const frenchI18n = {
      t: vi.fn((key: string, options?: unknown) => {
        if (key === 'facet-value') {
          const opts = options as {
            value: string;
            count: number;
            formattedCount: string;
          };
          return `${opts?.value} (${opts?.count})`;
        }
        return key;
      }),
      language: 'fr',
    } as unknown as i18n;

    await renderComponent({
      i18n: frenchI18n,
      facetValue: {value: 'test', numberOfResults: 1234},
    });

    expect(frenchI18n.t).toHaveBeenCalledWith('facet-value', {
      value: 'category: test',
      count: 1234,
      formattedCount: (1234).toLocaleString('fr'),
    });
  });

  it('should maintain button accessibility attributes', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('part', 'parent-button');
  });
});
