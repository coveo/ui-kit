import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {
  renderCategoryFacetParentAsTreeContainer,
  type CategoryFacetParentAsTreeContainerProps,
} from './parent-as-tree-container';

describe('renderCategoryFacetParentAsTreeContainer', () => {
  const defaultProps: CategoryFacetParentAsTreeContainerProps = {
    isTopLevel: false,
    className: undefined,
  };

  const renderComponent = async (
    props: Partial<CategoryFacetParentAsTreeContainerProps> = {},
    children = html`<li>Test child</li>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetParentAsTreeContainer({props: mergedProps})(
        children
      )}`
    );

    return {
      container,
      get ul() {
        return container.querySelector('ul');
      },
      get children() {
        return container.querySelectorAll('li');
      },
    };
  };

  it('should render a ul element', async () => {
    const {ul} = await renderComponent();

    expect(ul).toBeInTheDocument();
  });

  it('should render children inside the ul element', async () => {
    const {ul, container} = await renderComponent(
      {},
      html`<li class="test-child">Test Item</li>`
    );

    const child = container.querySelector('.test-child');

    expect(ul).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Item');
    expect(ul).toContainElement(child as HTMLElement);
  });

  it('should apply "parents" part when isTopLevel is true', async () => {
    const {ul} = await renderComponent({isTopLevel: true});

    expect(ul).toHaveAttribute('part', 'parents');
  });

  it('should apply "sub-parents" part when isTopLevel is false', async () => {
    const {ul} = await renderComponent({isTopLevel: false});

    expect(ul).toHaveAttribute('part', 'sub-parents');
  });

  it('should apply custom className when provided', async () => {
    const {ul} = await renderComponent({className: 'custom-class'});

    expect(ul).toHaveClass('custom-class');
  });

  it('does not apply class attribute when className is undefined', async () => {
    const {ul} = await renderComponent({className: undefined});

    expect(ul).not.toHaveAttribute('class');
  });

  it('should render multiple children', async () => {
    const {children} = await renderComponent(
      {},
      html`
        <li class="child-1">Item 1</li>
        <li class="child-2">Item 2</li>
        <li class="child-3">Item 3</li>
      `
    );

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveTextContent('Item 1');
    expect(children[1]).toHaveTextContent('Item 2');
    expect(children[2]).toHaveTextContent('Item 3');
  });
});
