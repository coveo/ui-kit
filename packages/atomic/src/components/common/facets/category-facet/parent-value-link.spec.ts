import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {vi, describe, it, expect} from 'vitest';
import {
  renderCategoryFacetParentValueLink,
  type CategoryFacetParentValueLinkProps,
} from './parent-value-link';
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
          data-is-selected=${props.isSelected}
        >
          ${children}
        </div>`
  ),
}));

describe('renderCategoryFacetParentValueLink', () => {
  const defaultProps: CategoryFacetParentValueLinkProps = {
    displayValue: 'Electronics',
    numberOfResults: 156,
    i18n: mockI18n,
    onClick: vi.fn(),
    searchQuery: '',
    isLeafValue: false,
    setRef: vi.fn(),
  };

  const renderComponent = (
    props: Partial<CategoryFacetParentValueLinkProps> = {},
    children = html`<span>Parent content</span>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetParentValueLink({props: mergedProps})(children)}`
    );
  };

  it('should render a parent value link component', async () => {
    const container = await renderComponent();
    const link = container.querySelector('[data-testid="category-value-link"]');

    expect(link).toBeInTheDocument();
  });

  it('should pass isParent as true to the parent component', async () => {
    const container = await renderComponent();
    const link = container.querySelector('[data-testid="category-value-link"]');

    expect(link).toHaveAttribute('data-is-parent', 'true');
  });

  it('should pass isSelected as true to the parent component', async () => {
    const container = await renderComponent();
    const link = container.querySelector('[data-testid="category-value-link"]');

    expect(link).toHaveAttribute('data-is-selected', 'true');
  });

  it('should pass through all other props to parent component', async () => {
    await renderComponent({
      displayValue: 'Test Category',
      numberOfResults: 789,
      searchQuery: 'search term',
      isLeafValue: true,
    });

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        displayValue: 'Test Category',
        numberOfResults: 789,
        searchQuery: 'search term',
        isLeafValue: true,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle click events through parent component', async () => {
    const onClickMock = vi.fn();
    await renderComponent({onClick: onClickMock});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        onClick: onClickMock,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle setRef function through parent component', async () => {
    const setRefMock = vi.fn();
    await renderComponent({setRef: setRefMock});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        setRef: setRefMock,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle leaf value property', async () => {
    await renderComponent({isLeafValue: true});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isLeafValue: true,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle node value property', async () => {
    await renderComponent({isLeafValue: false});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isLeafValue: false,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should pass search query to parent component', async () => {
    await renderComponent({searchQuery: 'electronics search'});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        searchQuery: 'electronics search',
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle display value correctly', async () => {
    await renderComponent({displayValue: 'Home & Garden'});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        displayValue: 'Home & Garden',
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle number of results', async () => {
    await renderComponent({numberOfResults: 2500});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        numberOfResults: 2500,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should pass i18n instance correctly', async () => {
    await renderComponent({i18n: mockI18n});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        i18n: mockI18n,
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should always override isParent and isSelected regardless of input', async () => {
    await renderComponent({
      displayValue: 'Test',
      numberOfResults: 1,
      i18n: mockI18n,
      onClick: vi.fn(),
      searchQuery: '',
      isLeafValue: false,
      setRef: vi.fn(),
    });

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should work with empty search query', async () => {
    await renderComponent({searchQuery: ''});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        searchQuery: '',
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should handle zero results', async () => {
    await renderComponent({numberOfResults: 0});

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        numberOfResults: 0,
        isParent: true,
        isSelected: true,
      }),
    });
  });
});
