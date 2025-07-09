import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {renderCategoryFacetTreeValueContainer} from './value-as-tree-container';

describe('#renderCategoryFacetTreeValueContainer', () => {
  const renderComponent = async (children = html`<span>Test child</span>`) => {
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetTreeValueContainer({props: {}})(children)}`
    );

    return {
      container,
      li: container.querySelector('li'),
      buttons: container.querySelectorAll('button'),
      subItems: container.querySelectorAll('.subcategories li'),
      facetValue: container.querySelector('.facet-value'),
      count: container.querySelector('.count'),
      treeitem: container.querySelector('[role="treeitem"]'),
      group: container.querySelector('[role="group"]'),
      childTreeItems: container.querySelectorAll(
        '[role="group"] [role="treeitem"]'
      ),
    };
  };

  it('should render a li element', async () => {
    const {li} = await renderComponent();

    expect(li).toBeInTheDocument();
  });

  it('should apply contents class to li element', async () => {
    const {li} = await renderComponent();

    expect(li).toHaveClass('contents');
  });

  it('should render children with correct text', async () => {
    const {container} = await renderComponent(
      html`<span class="test-child">Test Item</span>`
    );

    const child = container.querySelector('.test-child');
    expect(child).toHaveTextContent('Test Item');
  });

  it('should contain children within the li element', async () => {
    const {li, container} = await renderComponent(
      html`<span class="test-child">Test Item</span>`
    );

    const child = container.querySelector('.test-child');
    expect(li).toContainElement(child as HTMLElement);
  });

  it('should render multiple button elements', async () => {
    const {buttons} = await renderComponent(html`
      <button class="child-1">Button 1</button>
      <button class="child-2">Button 2</button>
    `);

    expect(buttons).toHaveLength(2);
  });

  it('should render button with correct text content', async () => {
    const {container} = await renderComponent(html`
      <button class="child-1">Button 1</button>
    `);

    const button = container.querySelector('.child-1');
    expect(button).toHaveTextContent('Button 1');
  });

  it('should render nested ul structure', async () => {
    const {container} = await renderComponent(html`
      <ul class="child-2">
        <li>Nested Item</li>
      </ul>
    `);

    const nestedUl = container.querySelector('.child-2');
    expect(nestedUl).toBeInTheDocument();
  });

  it('should render with no children', async () => {
    const {li} = await renderComponent(html``);

    expect(li?.children).toHaveLength(0);
  });

  it('should render facet value structure', async () => {
    const {facetValue} = await renderComponent(html`
      <div class="facet-value">
        <button>Category Value</button>
      </div>
    `);

    expect(facetValue).toBeInTheDocument();
  });

  it('should render count information', async () => {
    const {count} = await renderComponent(html`
      <span class="count">(42)</span>
    `);

    expect(count).toHaveTextContent('(42)');
  });

  it('should render subcategories list with correct length', async () => {
    const {subItems} = await renderComponent(html`
      <ul class="subcategories">
        <li>Subcategory 1</li>
        <li>Subcategory 2</li>
      </ul>
    `);

    expect(subItems).toHaveLength(2);
  });

  it('should render subcategory with correct text', async () => {
    const {subItems} = await renderComponent(html`
      <ul class="subcategories">
        <li>Subcategory 1</li>
      </ul>
    `);

    const subItem = subItems[0];
    expect(subItem).toHaveTextContent('Subcategory 1');
  });

  it('should render tree item with aria-expanded attribute', async () => {
    const {treeitem} = await renderComponent(html`
      <div role="treeitem" aria-expanded="true">
        <span>Parent Category</span>
      </div>
    `);

    expect(treeitem).toHaveAttribute('aria-expanded', 'true');
  });

  it('should render tree group structure', async () => {
    const {group} = await renderComponent(html`
      <ul role="group">
        <li role="treeitem">Child Category 1</li>
      </ul>
    `);

    expect(group).toBeInTheDocument();
  });

  it('should render multiple child tree items', async () => {
    const {childTreeItems} = await renderComponent(html`
      <ul role="group">
        <li role="treeitem">Child Category 1</li>
        <li role="treeitem">Child Category 2</li>
      </ul>
    `);

    expect(childTreeItems).toHaveLength(2);
  });

  it('should render text content directly', async () => {
    const {li} = await renderComponent(html`Simple text content`);

    expect(li).toHaveTextContent('Simple text content');
  });
});
