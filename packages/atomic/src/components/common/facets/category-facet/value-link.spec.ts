import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {html} from 'lit';
import {vi, describe, it, expect, beforeAll} from 'vitest';
import {
  renderCategoryFacetValueLink,
  type CategoryFacetValueLinkProps,
} from './value-link';

describe('renderCategoryFacetValueLink', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = (
    props: Partial<CategoryFacetValueLinkProps> = {},
    children = html`<div>Child</div>`
  ) => {
    const defaultProps: CategoryFacetValueLinkProps = {
      displayValue: 'Test Value',
      numberOfResults: 42,
      i18n,
      onClick: vi.fn(),
      isParent: false,
      isSelected: false,
      searchQuery: '',
      isLeafValue: false,
      setRef: vi.fn(),
      children: html`<div>Child</div>`,
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetValueLink({props: mergedProps})(children)}`
    );
  };

  it('should render the facet value link with correct structure', async () => {
    const container = await renderComponent();
    const listItem = container.querySelector('li');
    const button = container.querySelector('button');

    expect(listItem).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render as parent when isParent is true', async () => {
    const container = await renderComponent({isParent: true});
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('part', 'active-parent node-value');
  });

  it('should render as selected when isSelected is true', async () => {
    const container = await renderComponent({isSelected: true});
    const button = container.querySelector('button');
    expect(button).toHaveAttribute(
      'part',
      'value-link value-link-selected node-value'
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should render as leaf when isLeafValue is true', async () => {
    const container = await renderComponent({isLeafValue: true});
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('part', 'value-link leaf-value');
  });

  it('should call onClick when clicked', async () => {
    const onClickMock = vi.fn();
    const container = await renderComponent({onClick: onClickMock});
    const button = container.querySelector('button');
    button?.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should call setRef with the button element', async () => {
    const setRefMock = vi.fn();
    await renderComponent({setRef: setRefMock});
    expect(setRefMock).toHaveBeenCalled();
  });

  it('should render the facet-value-label-highlight', async () => {
    const container = await renderComponent({isSelected: true});
    const highlight = container.querySelector('span[part="value-label"]');
    expect(highlight).toBeInTheDocument();
  });

  it('should render children as subList', async () => {
    const container = await renderComponent(
      {},
      html`<span class="child-span">Extra</span>`
    );
    const child = container.querySelector('.child-span');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Extra');
  });

  it('should display the correct count format', async () => {
    const container = await renderComponent({numberOfResults: 123});
    const countElement = container.querySelector('.value-count');
    expect(countElement).toBeInTheDocument();
    expect(countElement).toHaveTextContent('(123)');
  });
});
