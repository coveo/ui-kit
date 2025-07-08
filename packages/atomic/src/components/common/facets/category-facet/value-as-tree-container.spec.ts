import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {renderCategoryFacetTreeValueContainer} from './value-as-tree-container';

describe('renderCategoryFacetTreeValueContainer', () => {
  const renderComponent = (children = html`<span>Test child</span>`) => {
    return renderFunctionFixture(
      html`${renderCategoryFacetTreeValueContainer({props: {}})(children)}`
    );
  };

  it('should render a li element', async () => {
    const container = await renderComponent();
    const li = container.querySelector('li');

    expect(li).toBeInTheDocument();
  });

  it('should apply contents class to li element', async () => {
    const container = await renderComponent();
    const li = container.querySelector('li');

    expect(li).toHaveClass('contents');
  });

  it('should render children with correct text', async () => {
    const container = await renderComponent(
      html`<span class="test-child">Test Item</span>`
    );

    const child = container.querySelector('.test-child');
    expect(child).toHaveTextContent('Test Item');
  });

  it('should contain children within the li element', async () => {
    const container = await renderComponent(
      html`<span class="test-child">Test Item</span>`
    );

    const li = container.querySelector('li');
    const child = container.querySelector('.test-child');
    expect(li).toContainElement(child as HTMLElement);
  });

  it('should render multiple button elements', async () => {
    const container = await renderComponent(html`
      <button class="child-1">Button 1</button>
      <button class="child-2">Button 2</button>
    `);

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
  });

  it('should render button with correct text content', async () => {
    const container = await renderComponent(html`
      <button class="child-1">Button 1</button>
    `);

    const button = container.querySelector('.child-1');
    expect(button).toHaveTextContent('Button 1');
  });

  it('should render nested ul structure', async () => {
    const container = await renderComponent(html`
      <ul class="child-2">
        <li>Nested Item</li>
      </ul>
    `);

    const nestedUl = container.querySelector('.child-2');
    expect(nestedUl).toBeInTheDocument();
  });

  it('should render with no children', async () => {
    const container = await renderComponent(html``);
    const li = container.querySelector('li');

    expect(li?.children).toHaveLength(0);
  });

  it('should render facet value structure', async () => {
    const container = await renderComponent(html`
      <div class="facet-value">
        <button>Category Value</button>
      </div>
    `);

    const facetValue = container.querySelector('.facet-value');
    expect(facetValue).toBeInTheDocument();
  });

  it('should render count information', async () => {
    const container = await renderComponent(html`
      <span class="count">(42)</span>
    `);

    const count = container.querySelector('.count');
    expect(count).toHaveTextContent('(42)');
  });

  it('should render subcategories list with correct length', async () => {
    const container = await renderComponent(html`
      <ul class="subcategories">
        <li>Subcategory 1</li>
        <li>Subcategory 2</li>
      </ul>
    `);

    const subItems = container.querySelectorAll('.subcategories li');
    expect(subItems).toHaveLength(2);
  });

  it('should render subcategory with correct text', async () => {
    const container = await renderComponent(html`
      <ul class="subcategories">
        <li>Subcategory 1</li>
      </ul>
    `);

    const subItem = container.querySelector('.subcategories li');
    expect(subItem).toHaveTextContent('Subcategory 1');
  });

  it('should render tree item with aria-expanded attribute', async () => {
    const container = await renderComponent(html`
      <div role="treeitem" aria-expanded="true">
        <span>Parent Category</span>
      </div>
    `);

    const treeitem = container.querySelector('[role="treeitem"]');
    expect(treeitem).toHaveAttribute('aria-expanded', 'true');
  });

  it('should render tree group structure', async () => {
    const container = await renderComponent(html`
      <ul role="group">
        <li role="treeitem">Child Category 1</li>
      </ul>
    `);

    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
  });

  it('should render multiple child tree items', async () => {
    const container = await renderComponent(html`
      <ul role="group">
        <li role="treeitem">Child Category 1</li>
        <li role="treeitem">Child Category 2</li>
      </ul>
    `);

    const childItems = container.querySelectorAll(
      '[role="group"] [role="treeitem"]'
    );
    expect(childItems).toHaveLength(2);
  });

  it('should render text content directly', async () => {
    const container = await renderComponent(html`Simple text content`);
    const li = container.querySelector('li');

    expect(li).toHaveTextContent('Simple text content');
  });
});
