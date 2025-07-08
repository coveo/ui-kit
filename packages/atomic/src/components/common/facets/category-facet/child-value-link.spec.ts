import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {html} from 'lit';
import {vi, describe, it, expect, beforeAll} from 'vitest';
import {
  renderCategoryFacetChildValueLink,
  type CategoryFacetChildValueLinkProps,
} from './child-value-link';
import {renderCategoryFacetValueLink} from './value-link';

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
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<CategoryFacetChildValueLinkProps> = {},
    children = html`<span>Child content</span>`
  ) => {
    const defaultProps: CategoryFacetChildValueLinkProps = {
      displayValue: 'Laptops',
      numberOfResults: 42,
      i18n,
      onClick: vi.fn(),
      isSelected: false,
      searchQuery: '',
      isLeafValue: true,
      setRef: vi.fn(),
    };
    const mergedProps = {...defaultProps, ...props};
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetChildValueLink({props: mergedProps})(children)}`
    );

    return {
      container,
      link: container.querySelector('[data-testid="category-value-link"]'),
    };
  };

  it('should render a child value link component', async () => {
    const {link} = await renderComponent();

    expect(link).toBeInTheDocument();
  });

  it('should pass isParent as false to the parent component', async () => {
    const {link} = await renderComponent();

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
});
