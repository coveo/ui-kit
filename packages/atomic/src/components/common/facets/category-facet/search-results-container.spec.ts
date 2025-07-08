import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {renderCategoryFacetSearchResultsContainer} from './search-results-container';

describe('renderCategoryFacetSearchResultsContainer', () => {
  const renderComponent = async (children = html`<li>Test child</li>`) => {
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetSearchResultsContainer()(children)}`
    );

    return {
      container,
      ul: container.querySelector('ul'),
      children: container.querySelectorAll('li'),
      getChildByText: (text: string) =>
        Array.from(container.querySelectorAll('li')).find((el: Element) =>
          el.textContent?.includes(text)
        ),
      buttons: container.querySelectorAll('button'),
      spans: container.querySelectorAll('span'),
      optionElements: container.querySelectorAll('[role="option"]'),
    };
  };

  it('should render a ul element', async () => {
    const {ul} = await renderComponent();

    expect(ul).toBeInTheDocument();
  });

  it('should have correct part attribute on ul element', async () => {
    const {ul} = await renderComponent();

    expect(ul).toHaveAttribute('part', 'search-results');
  });

  it('should render children inside the ul element', async () => {
    const {ul, container} = await renderComponent(
      html`<li class="test-child">Test Item</li>`
    );

    const child = container.querySelector('.test-child');

    expect(ul).toBeInTheDocument();
    expect(child).toBeInTheDocument();
  });

  it('should display correct text content in children', async () => {
    const {container} = await renderComponent(
      html`<li class="test-child">Test Item</li>`
    );

    const child = container.querySelector('.test-child');

    expect(child).toHaveTextContent('Test Item');
  });

  it('should contain children within ul element', async () => {
    const {ul, container} = await renderComponent(
      html`<li class="test-child">Test Item</li>`
    );

    const child = container.querySelector('.test-child');

    expect(ul).toContainElement(child as HTMLElement);
  });

  it('should render multiple children', async () => {
    const {children} = await renderComponent(html`
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    `);

    expect(children).toHaveLength(3);
  });

  it('should display correct text in first child', async () => {
    const {children} = await renderComponent(html`
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    `);

    expect(children[0]).toHaveTextContent('Item 1');
  });

  it('should display correct text in second child', async () => {
    const {children} = await renderComponent(html`
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    `);

    expect(children[1]).toHaveTextContent('Item 2');
  });

  it('should display correct text in third child', async () => {
    const {children} = await renderComponent(html`
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    `);

    expect(children[2]).toHaveTextContent('Item 3');
  });

  it('should render with no children', async () => {
    const {ul} = await renderComponent(html``);

    expect(ul?.children).toHaveLength(0);
  });

  it('should render complex children structure', async () => {
    const {buttons, spans} = await renderComponent(html`
      <li>
        <button>Search Result 1</button>
        <span>Details</span>
      </li>
      <li>
        <button>Search Result 2</button>
        <span>More Details</span>
      </li>
    `);

    expect(buttons).toHaveLength(2);
    expect(spans).toHaveLength(2);
  });

  it('should display correct text in first button', async () => {
    const {buttons} = await renderComponent(html`
      <li>
        <button>Search Result 1</button>
        <span>Details</span>
      </li>
      <li>
        <button>Search Result 2</button>
        <span>More Details</span>
      </li>
    `);

    expect(buttons[0]).toHaveTextContent('Search Result 1');
  });

  it('should display correct text in second button', async () => {
    const {buttons} = await renderComponent(html`
      <li>
        <button>Search Result 1</button>
        <span>Details</span>
      </li>
      <li>
        <button>Search Result 2</button>
        <span>More Details</span>
      </li>
    `);

    expect(buttons[1]).toHaveTextContent('Search Result 2');
  });

  it('should maintain semantic structure for search results', async () => {
    const {optionElements} = await renderComponent(html`
      <li role="option">Search Option 1</li>
      <li role="option">Search Option 2</li>
    `);

    expect(optionElements).toHaveLength(2);
  });

  it('should display correct text in first option element', async () => {
    const {optionElements} = await renderComponent(html`
      <li role="option">Search Option 1</li>
      <li role="option">Search Option 2</li>
    `);

    expect(optionElements[0]).toHaveTextContent('Search Option 1');
  });

  it('should display correct text in second option element', async () => {
    const {optionElements} = await renderComponent(html`
      <li role="option">Search Option 1</li>
      <li role="option">Search Option 2</li>
    `);

    expect(optionElements[1]).toHaveTextContent('Search Option 2');
  });
});
