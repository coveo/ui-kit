import {html} from 'lit';
import {beforeAll, describe, expect, it, type MockedFunction, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {getAllCategoriesLocalizedLabel} from './all-categories-localized-label';
import {
  type CategoryFacetSearchValueProps,
  renderCategoryFacetSearchValue,
} from './search-value';

vi.mock('./all-categories-localized-label', {spy: true});
vi.mock('@/src/utils/field-utils', () => ({
  getFieldValueCaption: vi.fn(
    (field: string, value: string) => `${field}: ${value}`
  ),
}));

describe('#renderCategoryFacetSearchValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let mockedGetAllCategoriesLocalizedLabel: MockedFunction<
    typeof getAllCategoriesLocalizedLabel
  >;

  beforeAll(async () => {
    i18n = await createTestI18n();
    mockedGetAllCategoriesLocalizedLabel = vi
      .mocked(getAllCategoriesLocalizedLabel)
      .mockReturnValue('All Categories');
  });

  const renderComponent = async (
    props: Partial<CategoryFacetSearchValueProps> = {}
  ) => {
    const defaultProps: CategoryFacetSearchValueProps = {
      value: {
        count: 42,
        path: ['electronics', 'computers'],
        displayValue: 'laptops',
      },
      i18n,
      field: 'category',
      onClick: vi.fn(),
      searchQuery: 'laptop',
    };
    const mergedProps = {...defaultProps, ...props};
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetSearchValue({props: mergedProps})}`
    );

    return {
      container,
      li: container.querySelector('li'),
      button: container.querySelector('button'),
      labelSpan: container.querySelector('span[part="value-label"]'),
      countSpan: container.querySelector('.value-count'),
      countSpanByPart: container.querySelector('[part="value-count"]'),
      pathContainer: container.querySelector('[part="search-result-path"]'),
      separators: container.querySelectorAll('.mx-0\\.5'),
      truncateSpans: container.querySelectorAll('.truncate, .max-w-max'),
    };
  };

  it('should render a list item element', async () => {
    const {li} = await renderComponent();

    expect(li).toBeInTheDocument();
  });

  it('should render button with correct structure', async () => {
    const {button} = await renderComponent();

    expect(button).toBeInTheDocument();
  });

  it('should apply search-result part to button', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute('part', 'search-result');
  });

  it('should render facet value label highlight', async () => {
    const {labelSpan} = await renderComponent();

    expect(labelSpan).toBeInTheDocument();
  });

  it('should render count with correct formatting', async () => {
    const {countSpan} = await renderComponent();

    expect(countSpan).toHaveTextContent('(42)');
  });

  it('should apply value-count part to count span', async () => {
    const {countSpanByPart} = await renderComponent();

    expect(countSpanByPart).toBeInTheDocument();
  });

  it('should render path with "in" label', async () => {
    const {pathContainer} = await renderComponent();

    expect(pathContainer).toHaveTextContent('in');
  });

  it('should render path with category values', async () => {
    const {pathContainer} = await renderComponent();

    expect(pathContainer).toHaveTextContent('category: electronics');
  });

  it('should render path separator', async () => {
    const {separators} = await renderComponent();

    expect(separators.length).toBeGreaterThan(0);
  });

  it('should call onClick when button is clicked', async () => {
    const onClickMock = vi.fn();
    const {button} = await renderComponent({onClick: onClickMock});

    button?.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should generate correct aria-label', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute('aria-label');
  });

  it('should render empty path as all categories', async () => {
    const {container} = await renderComponent({
      value: {count: 10, path: [], displayValue: 'test'},
    });

    expect(container).toHaveTextContent('All Categories');
  });

  it('should format large numbers correctly', async () => {
    const {countSpan} = await renderComponent({
      value: {count: 1234, path: [], displayValue: 'test'},
    });

    expect(countSpan).toHaveTextContent('(1,234)');
  });

  it('should apply truncate classes for long paths', async () => {
    const {truncateSpans} = await renderComponent();

    expect(truncateSpans.length).toBeGreaterThan(0);
  });

  it('should handle ellipsed paths for long hierarchies', async () => {
    const longPath = ['level1', 'level2', 'level3', 'level4', 'level5'];
    const {container} = await renderComponent({
      value: {count: 5, path: longPath, displayValue: 'test'},
    });

    expect(container).toHaveTextContent('...');
  });

  it('should apply group class to button', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveClass('group');
  });

  it('should apply flex class to button', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveClass('flex');
  });

  it('should apply w-full class to button', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveClass('w-full');
  });

  it('should render search query highlighting', async () => {
    const {labelSpan} = await renderComponent({searchQuery: 'laptop'});

    expect(labelSpan).toBeInTheDocument();
  });

  it('should apply search-result-path part to path container', async () => {
    const {pathContainer} = await renderComponent();

    expect(pathContainer).toBeInTheDocument();
  });

  it('calls getAllCategoriesLocalizedLabel with the correct parameters', async () => {
    const facetId = 'my-facet-id';
    const field = 'my-field';
    await renderComponent({facetId, field});
    expect(mockedGetAllCategoriesLocalizedLabel).toHaveBeenCalledWith({
      facetId,
      field,
      i18n,
    });
  });
});
