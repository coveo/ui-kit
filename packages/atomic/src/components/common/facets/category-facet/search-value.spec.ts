import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {vi, describe, it, expect} from 'vitest';
import {
  renderCategoryFacetSearchValue,
  type CategoryFacetSearchValueProps,
} from './search-value';

const mockI18n = {
  t: vi.fn((key: string, options?: unknown) => {
    const opts = options as {
      text?: string;
      child?: string;
      parent?: string;
      value?: string;
      count?: number;
      formattedCount?: string;
    };
    switch (key) {
      case 'facet-value':
        return `${opts?.value} (${opts?.count})`;
      case 'between-parentheses':
        return `(${opts?.text})`;
      case 'under':
        return `${opts?.child} under ${opts?.parent}`;
      case 'in':
        return 'in';
      case 'all-categories':
        return 'All Categories';
      default:
        return key;
    }
  }),
  language: 'en',
} as unknown as i18n;

// Mock getFieldValueCaption function
vi.mock('../../../../utils/field-utils', () => ({
  getFieldValueCaption: vi.fn(
    (field: string, value: string) => `${field}: ${value}`
  ),
}));

describe('renderCategoryFacetSearchValue', () => {
  const defaultProps: CategoryFacetSearchValueProps = {
    value: {
      count: 42,
      path: ['electronics', 'computers'],
      displayValue: 'laptops',
    },
    i18n: mockI18n,
    field: 'category',
    onClick: vi.fn(),
    searchQuery: 'laptop',
  };

  const renderComponent = (
    props: Partial<CategoryFacetSearchValueProps> = {}
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetSearchValue({props: mergedProps})}`
    );
  };

  it('should render a list item element', async () => {
    const container = await renderComponent();
    const li = container.querySelector('li');

    expect(li).toBeInTheDocument();
  });

  it('should render button with correct structure', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toBeInTheDocument();
  });

  it('should apply search-result part to button', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toHaveAttribute('part', 'search-result');
  });

  it('should render facet value label highlight', async () => {
    const container = await renderComponent();
    const labelSpan = container.querySelector('span[part="value-label"]');

    expect(labelSpan).toBeInTheDocument();
  });

  it('should render count with correct formatting', async () => {
    const container = await renderComponent();
    const countSpan = container.querySelector('.value-count');

    expect(countSpan).toHaveTextContent('(42)');
  });

  it('should apply value-count part to count span', async () => {
    const container = await renderComponent();
    const countSpan = container.querySelector('[part="value-count"]');

    expect(countSpan).toBeInTheDocument();
  });

  it('should render path with "in" label', async () => {
    const container = await renderComponent();
    const pathContainer = container.querySelector(
      '[part="search-result-path"]'
    );

    expect(pathContainer).toHaveTextContent('in');
  });

  it('should render path with category values', async () => {
    const container = await renderComponent();
    const pathContainer = container.querySelector(
      '[part="search-result-path"]'
    );

    expect(pathContainer).toHaveTextContent('category: electronics');
  });

  it('should render path separator', async () => {
    const container = await renderComponent();
    const separators = container.querySelectorAll('.mx-0\\.5');

    expect(separators.length).toBeGreaterThan(0);
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

    expect(button).toHaveAttribute('aria-label');
    expect(mockI18n.t).toHaveBeenCalledWith('under', expect.any(Object));
  });

  it('should render with empty path as all categories', async () => {
    const container = await renderComponent({
      value: {count: 10, path: [], displayValue: 'test'},
    });

    expect(container).toHaveTextContent('All Categories');
  });

  it('should format large numbers correctly', async () => {
    const container = await renderComponent({
      value: {count: 1234, path: [], displayValue: 'test'},
    });
    const countSpan = container.querySelector('.value-count');

    expect(countSpan).toHaveTextContent('(1,234)');
  });

  it('should apply truncate classes for long paths', async () => {
    const container = await renderComponent();
    const truncateSpans = container.querySelectorAll('.truncate, .max-w-max');

    expect(truncateSpans.length).toBeGreaterThan(0);
  });

  it('should handle ellipsed paths for long hierarchies', async () => {
    const longPath = ['level1', 'level2', 'level3', 'level4', 'level5'];
    const container = await renderComponent({
      value: {count: 5, path: longPath, displayValue: 'test'},
    });

    expect(container).toHaveTextContent('...');
  });

  it('should apply correct CSS classes to button', async () => {
    const container = await renderComponent();
    const button = container.querySelector('button');

    expect(button).toHaveClass('group');
    expect(button).toHaveClass('flex');
    expect(button).toHaveClass('w-full');
  });

  it('should render search query highlighting', async () => {
    const container = await renderComponent({searchQuery: 'laptop'});
    const labelSpan = container.querySelector('span[part="value-label"]');

    expect(labelSpan).toBeInTheDocument();
  });

  it('should apply search-result-path part to path container', async () => {
    const container = await renderComponent();
    const pathContainer = container.querySelector(
      '[part="search-result-path"]'
    );

    expect(pathContainer).toBeInTheDocument();
  });
});
