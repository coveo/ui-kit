import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {renderCategoryFacetSearchResultsContainer} from './search-results-container';

describe('renderCategoryFacetSearchResultsContainer', () => {
  const renderComponent = (children = html`<li>Test child</li>`) => {
    return renderFunctionFixture(
      html`${renderCategoryFacetSearchResultsContainer()(children)}`
    );
  };

  it('should render a ul element with correct attributes', async () => {
    const container = await renderComponent();
    const ul = container.querySelector('ul');

    expect(ul).toBeInTheDocument();
    expect(ul).toHaveAttribute('part', 'search-results');
  });

  it('should render children inside the ul element', async () => {
    const container = await renderComponent(
      html`<li class="test-child">Test Item</li>`
    );

    const ul = container.querySelector('ul');
    const child = container.querySelector('.test-child');

    expect(ul).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Item');
    expect(ul).toContainElement(child as HTMLElement);
  });

  it('should render multiple children', async () => {
    const container = await renderComponent(html`
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    `);

    const ul = container.querySelector('ul');
    const children = container.querySelectorAll('li');

    expect(ul).toBeInTheDocument();
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveTextContent('Item 1');
    expect(children[1]).toHaveTextContent('Item 2');
    expect(children[2]).toHaveTextContent('Item 3');
  });

  it('should render with no children', async () => {
    const container = await renderComponent(html``);
    const ul = container.querySelector('ul');

    expect(ul).toBeInTheDocument();
    expect(ul).toHaveAttribute('part', 'search-results');
    expect(ul?.children).toHaveLength(0);
  });

  it('should render with complex children structure', async () => {
    const container = await renderComponent(html`
      <li>
        <button>Search Result 1</button>
        <span>Details</span>
      </li>
      <li>
        <button>Search Result 2</button>
        <span>More Details</span>
      </li>
    `);

    const ul = container.querySelector('ul');
    const buttons = container.querySelectorAll('button');
    const spans = container.querySelectorAll('span');

    expect(ul).toBeInTheDocument();
    expect(buttons).toHaveLength(2);
    expect(spans).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Search Result 1');
    expect(buttons[1]).toHaveTextContent('Search Result 2');
  });

  it('should maintain semantic structure for search results', async () => {
    const container = await renderComponent(html`
      <li role="option">Search Option 1</li>
      <li role="option">Search Option 2</li>
    `);

    const ul = container.querySelector('ul');
    const options = container.querySelectorAll('[role="option"]');

    expect(ul).toBeInTheDocument();
    expect(ul).toHaveAttribute('part', 'search-results');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Search Option 1');
    expect(options[1]).toHaveTextContent('Search Option 2');
  });
});
