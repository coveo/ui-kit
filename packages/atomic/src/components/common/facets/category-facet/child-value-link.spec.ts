import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {vi, describe, it, expect} from 'vitest';
import {
  renderCategoryFacetChildValueLink,
  type CategoryFacetChildValueLinkProps,
} from './child-value-link';
import {renderCategoryFacetValueLink} from './value-link';

const mockI18n = {
  t: vi.fn((key: string, options?: unknown) => {
    const opts = options as {
      count?: number;
      formattedCount?: string;
      value?: string;
    };
    switch (key) {
      case 'facet-value':
        return `${opts?.value} (${opts?.count})`;
      case 'between-parentheses':
        return `(${opts?.formattedCount})`;
      case 'clear-filter':
        return 'Clear filter';
      default:
        return key;
    }
  }),
  language: 'en',
} as unknown as i18n;

vi.mock('./value-link', () => ({
  renderCategoryFacetValueLink: vi.fn(
    ({props}) =>
      (children: unknown) =>
        html`<div
          data-testid="category-value-link"
          data-is-parent=${props.isParent}
        >
          ${children}
        </div>`
  ),
}));

describe('renderCategoryFacetChildValueLink', () => {
  const defaultProps: CategoryFacetChildValueLinkProps = {
    displayValue: 'Laptops',
    numberOfResults: 42,
    i18n: mockI18n,
    onClick: vi.fn(),
    isSelected: false,
    searchQuery: '',
    isLeafValue: true,
    setRef: vi.fn(),
  };

  const renderComponent = (
    props: Partial<CategoryFacetChildValueLinkProps> = {},
    children = html`<span>Child content</span>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetChildValueLink({props: mergedProps})(children)}`
    );
  };

  it('should render a child value link component', async () => {
    const container = await renderComponent();
    const link = container.querySelector('[data-testid="category-value-link"]');

    expect(link).toBeInTheDocument();
  });

  it('should pass isParent as false to the parent component', async () => {
    const container = await renderComponent();
    const link = container.querySelector('[data-testid="category-value-link"]');

    expect(link).toHaveAttribute('data-is-parent', 'false');
  });

  it('should pass through all other props to parent component', async () => {
    await renderComponent({
      displayValue: 'Test Value',
      numberOfResults: 123,
      isSelected: true,
      searchQuery: 'test',
      isLeafValue: false,
    });

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        displayValue: 'Test Value',
        numberOfResults: 123,
        isSelected: true,
        searchQuery: 'test',
        isLeafValue: false,
        isParent: false,
      }),
    });
  });

  it('should handle click events through parent component', async () => {
    const onClickMock = vi.fn();
    await renderComponent({onClick: onClickMock});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        onClick: onClickMock,
      }),
    });
  });

  it('should handle setRef function through parent component', async () => {
    const setRefMock = vi.fn();
    await renderComponent({setRef: setRefMock});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        setRef: setRefMock,
      }),
    });
  });

  it('should work with selected state', async () => {
    await renderComponent({isSelected: true});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isSelected: true,
        isParent: false,
      }),
    });
  });

  it('should work with unselected state', async () => {
    await renderComponent({isSelected: false});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isSelected: false,
        isParent: false,
      }),
    });
  });

  it('should handle leaf value property', async () => {
    await renderComponent({isLeafValue: true});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isLeafValue: true,
      }),
    });
  });

  it('should handle node value property', async () => {
    await renderComponent({isLeafValue: false});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isLeafValue: false,
      }),
    });
  });

  it('should pass search query to parent component', async () => {
    await renderComponent({searchQuery: 'laptop search'});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        searchQuery: 'laptop search',
      }),
    });
  });

  it('should handle display value correctly', async () => {
    await renderComponent({displayValue: 'Gaming Laptops'});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        displayValue: 'Gaming Laptops',
      }),
    });
  });

  it('should handle number of results', async () => {
    await renderComponent({numberOfResults: 999});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        numberOfResults: 999,
      }),
    });
  });

  it('should pass i18n instance correctly', async () => {
    await renderComponent({i18n: mockI18n});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        i18n: mockI18n,
      }),
    });
  });
});
