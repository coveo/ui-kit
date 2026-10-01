import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type CategoryFacetActiveValueProps,
  renderCategoryFacetActiveValue,
} from './active-value';

describe('#renderCategoryFacetActiveValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<CategoryFacetActiveValueProps> = {},
    children = html`<span class="child-span">Parent content</span>`
  ) => {
    const defaultProps: CategoryFacetActiveValueProps = {
      displayValue: 'Electronics',
      numberOfResults: 156,
      i18n,
      searchQuery: '',
      isLeafValue: false,
      setRef: vi.fn(),
    };
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetActiveValue({props: {...defaultProps, ...props}})(children)}`
    );

    return {
      container,
      listItem: container.querySelector('li'),
      activeParent: container.querySelector('[part~="active-parent"]'),
      highlight: container.querySelector('span[part="value-label"]'),
      countElement: container.querySelector('.value-count'),
    };
  };

  it('should render the active parent inside a list item', async () => {
    const {listItem, activeParent} = await renderComponent();

    expect(listItem).toBeInTheDocument();
    expect(activeParent).toBeInTheDocument();
  });

  it('should not render an interactive element', async () => {
    const {container, activeParent} = await renderComponent();

    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
    expect(activeParent?.tagName).toBe('SPAN');
  });

  it('should mark the value as the current one', async () => {
    const {activeParent} = await renderComponent();

    expect(activeParent).toHaveAttribute('aria-current', 'true');
  });

  it('should stay focusable programmatically without being reachable by tab', async () => {
    const {activeParent} = await renderComponent();

    expect(activeParent).toHaveAttribute('tabindex', '-1');
  });

  it('should render the "leaf-value" part when isLeafValue is true', async () => {
    const {activeParent} = await renderComponent({isLeafValue: true});

    expect(activeParent).toHaveAttribute('part', expect.stringContaining('leaf-value'));
  });

  it('should render the "node-value" part when isLeafValue is false', async () => {
    const {activeParent} = await renderComponent({isLeafValue: false});

    expect(activeParent).toHaveAttribute('part', expect.stringContaining('node-value'));
  });

  it('should render the facet value label highlight', async () => {
    const {highlight} = await renderComponent();

    expect(highlight).toBeInTheDocument();
    expect(highlight).toHaveTextContent('Electronics');
  });

  it('should display the correct count format', async () => {
    const {countElement} = await renderComponent({numberOfResults: 1234});

    expect(countElement).toHaveTextContent('(1,234)');
  });

  it('should call setRef with the rendered element', async () => {
    const setRefMock = vi.fn();
    await renderComponent({setRef: setRefMock});

    expect(setRefMock).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('should render children as the nested values container', async () => {
    const {container} = await renderComponent({}, html`<span class="child-span">Extra</span>`);

    expect(container.querySelector('.child-span')).toHaveTextContent('Extra');
  });
});
