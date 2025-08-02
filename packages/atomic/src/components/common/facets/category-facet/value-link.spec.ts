import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type CategoryFacetValueLinkProps,
  renderCategoryFacetValueLink,
} from './value-link';

describe('#renderCategoryFacetValueLink', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
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
    };
    const mergedProps = {...defaultProps, ...props};
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetValueLink({props: mergedProps})(children)}`
    );

    return {
      container,
      listItem: container.querySelector('li'),
      button: container.querySelector('button'),
      highlight: container.querySelector('span[part="value-label"]'),
      countElement: container.querySelector('.value-count'),
    };
  };

  it('should render the facet value link with correct structure', async () => {
    const {listItem, button} = await renderComponent();

    expect(listItem).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('should render the "active-parent" when isParent is true', async () => {
    const {button} = await renderComponent({isParent: true});
    expect(button).toHaveAttribute(
      'part',
      expect.stringContaining('active-parent')
    );
  });

  it('should not render the "active-parent" when isParent is false', async () => {
    const {button} = await renderComponent({isParent: false});
    expect(button).not.toHaveAttribute(
      'part',
      expect.stringContaining('active-parent')
    );
  });

  it('should render as selected when isSelected is true', async () => {
    const {button} = await renderComponent({isSelected: true});
    expect(button).toHaveAttribute(
      'part',
      expect.stringContaining('value-link-selected')
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not render as selected when isSelected is false', async () => {
    const {button} = await renderComponent({isSelected: false});
    expect(button).not.toHaveAttribute(
      'part',
      expect.stringContaining('value-link-selected')
    );
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render as leaf when isLeafValue is true', async () => {
    const {button} = await renderComponent({isLeafValue: true});
    expect(button).toHaveAttribute(
      'part',
      expect.stringContaining('leaf-value')
    );
  });

  it('should not render as leaf when isLeafValue is false', async () => {
    const {button} = await renderComponent({isLeafValue: false});
    expect(button).not.toHaveAttribute(
      'part',
      expect.stringContaining('leaf-value')
    );
  });

  it('should call onClick when clicked', async () => {
    const onClickMock = vi.fn();
    const {button} = await renderComponent({onClick: onClickMock});
    button?.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should call setRef with the button element', async () => {
    const setRefMock = vi.fn();
    await renderComponent({setRef: setRefMock});
    expect(setRefMock).toHaveBeenCalled();
  });

  it('should render the facet-value-label-highlight', async () => {
    const {highlight} = await renderComponent({isSelected: true});
    expect(highlight).toBeInTheDocument();
  });

  it('should render children as subList', async () => {
    const {container} = await renderComponent(
      {},
      html`<span class="child-span">Extra</span>`
    );
    const child = container.querySelector('.child-span');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Extra');
  });

  it('should display the correct count format', async () => {
    const {countElement} = await renderComponent({numberOfResults: 1234});
    expect(countElement).toBeInTheDocument();
    expect(countElement).toHaveTextContent('(1,234)');
  });
});
