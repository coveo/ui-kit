import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type CategoryFacetChildrenAsTreeContainerProps,
  renderCategoryFacetChildrenAsTreeContainer,
} from './children-as-tree-container';

describe('#renderCategoryFacetChildrenAsTreeContainer', () => {
  const defaultProps: CategoryFacetChildrenAsTreeContainerProps = {
    className: undefined,
  };

  const renderComponent = (
    props: Partial<CategoryFacetChildrenAsTreeContainerProps> = {},
    children = html`<li>Test child</li>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCategoryFacetChildrenAsTreeContainer({props: mergedProps})(
        children
      )}`
    );
  };

  it('should render a ul element with correct part attribute', async () => {
    const container = await renderComponent();
    const ul = container.querySelector('ul');

    expect(ul).toBeInTheDocument();
    expect(ul).toHaveAttribute('part', 'values');
  });

  it('should apply custom className when provided', async () => {
    const container = await renderComponent({className: 'custom-class'});
    const ul = container.querySelector('ul');

    expect(ul).toHaveClass('custom-class');
  });

  it('should not apply class attribute when className is undefined', async () => {
    const container = await renderComponent({className: undefined});
    const ul = container.querySelector('ul');

    expect(ul).not.toHaveAttribute('class');
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
});
