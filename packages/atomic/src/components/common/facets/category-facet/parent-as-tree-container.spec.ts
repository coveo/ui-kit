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

  const renderComponent = (
    props: Partial<CategoryFacetParentAsTreeContainerProps> = {},
    children = html`<li>Test child</li>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetParentAsTreeContainer({props: mergedProps})(
        children
      )}`
    );
  };

  it('should render a ul element', async () => {
    const container = await renderComponent();
    const ul = container.querySelector('ul');

    expect(ul).toBeInTheDocument();
  });

  it('should render children inside the ul element', async () => {
    const container = await renderComponent(
      {},
      html`<li class="test-child">Test Item</li>`
    );

    const ul = container.querySelector('ul');
    const child = container.querySelector('.test-child');

    expect(ul).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Item');
    expect(ul).toContainElement(child as HTMLElement);
  });

  it('should apply "parents" part when isTopLevel is true', async () => {
    const container = await renderComponent({isTopLevel: true});
    const ul = container.querySelector('ul');

    expect(ul).toHaveAttribute('part', 'parents');
  });

  it('should apply "sub-parents" part when isTopLevel is false', async () => {
    const container = await renderComponent({isTopLevel: false});
    const ul = container.querySelector('ul');

    expect(ul).toHaveAttribute('part', 'sub-parents');
  });

  it('should apply custom className when provided', async () => {
    const container = await renderComponent({className: 'custom-class'});
    const ul = container.querySelector('ul');

    expect(ul).toHaveClass('custom-class');
  });

  it('does not apply class attribute when className is undefined', async () => {
    const container = await renderComponent({className: undefined});
    const ul = container.querySelector('ul');

    expect(ul).not.toHaveAttribute('class');
  });

  it('should apply empty string as className', async () => {
    const container = await renderComponent({className: ''});
    const ul = container.querySelector('ul');

    expect(ul).toHaveAttribute('class', '');
  });

  it('should render multiple children', async () => {
    const container = await renderComponent(
      {},
      html`
        <li class="child-1">Item 1</li>
        <li class="child-2">Item 2</li>
        <li class="child-3">Item 3</li>
      `
    );

    const ul = container.querySelector('ul');
    const children = container.querySelectorAll('li');

    expect(ul).toBeInTheDocument();
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveTextContent('Item 1');
    expect(children[1]).toHaveTextContent('Item 2');
    expect(children[2]).toHaveTextContent('Item 3');
  });

  it('should render top-level container with className and children', async () => {
    const container = await renderComponent(
      {isTopLevel: true, className: 'top-level-container'},
      html`<li class="parent-item">Parent Item</li>`
    );

    const ul = container.querySelector('ul');
    const child = container.querySelector('.parent-item');

    expect(ul).toHaveClass('top-level-container');
    expect(ul).toHaveAttribute('part', 'parents');
    expect(child).toHaveTextContent('Parent Item');
    expect(ul).toContainElement(child as HTMLElement);
  });

  it('should render sub-level container with className and children', async () => {
    const container = await renderComponent(
      {isTopLevel: false, className: 'sub-level-container'},
      html`<li class="sub-parent-item">Sub Parent Item</li>`
    );

    const ul = container.querySelector('ul');
    const child = container.querySelector('.sub-parent-item');

    expect(ul).toHaveClass('sub-level-container');
    expect(ul).toHaveAttribute('part', 'sub-parents');
    expect(child).toHaveTextContent('Sub Parent Item');
    expect(ul).toContainElement(child as HTMLElement);
  });
});
