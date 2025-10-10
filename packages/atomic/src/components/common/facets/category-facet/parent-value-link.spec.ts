import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type CategoryFacetParentValueLinkProps,
  renderCategoryFacetParentValueLink,
} from './parent-value-link';
import {renderCategoryFacetValueLink} from './value-link';

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

describe('#renderCategoryFacetParentValueLink', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<CategoryFacetParentValueLinkProps> = {},
    children = html`<span>Parent content</span>`
  ) => {
    const defaultProps: CategoryFacetParentValueLinkProps = {
      displayValue: 'Electronics',
      numberOfResults: 156,
      i18n,
      onClick: vi.fn(),
      searchQuery: '',
      isLeafValue: false,
      setRef: vi.fn(),
    };
    const mergedProps = {...defaultProps, ...props};
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetParentValueLink({props: mergedProps})(children)}`
    );

    return {
      container,
      link: container.querySelector('[data-testid="category-value-link"]'),
    };
  };

  it('should render a parent value link component', async () => {
    const {link} = await renderComponent();

    expect(link).toBeInTheDocument();
  });

  it('should pass isParent as true to the parent component', async () => {
    const {link} = await renderComponent();

    expect(link).toHaveAttribute('data-is-parent', 'true');
  });

  it('should pass isSelected as true to the parent component', async () => {
    const {link} = await renderComponent();

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
    await renderComponent();

    expect(renderCategoryFacetValueLink).toHaveBeenCalledWith({
      props: expect.objectContaining({
        isParent: true,
        isSelected: true,
      }),
    });
  });

  it('should always override isParent and isSelected regardless of input', async () => {
    await renderComponent({
      displayValue: 'Test',
      numberOfResults: 1,
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
