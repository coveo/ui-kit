import {html, render, TemplateResult} from 'lit';
import {loadMoreContainer} from './container';

describe('loadMoreContainer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderLoadMoreContainer = (children: TemplateResult) => {
    render(html`${loadMoreContainer(children)}`, container);
  };

  test('should render the container with the correct classes', () => {
    renderLoadMoreContainer(html`<span>Test</span>`);

    const div = container.querySelector('div');
    expect(div).toHaveClass('flex');
    expect(div).toHaveClass('flex-col');
    expect(div).toHaveClass('items-center');
  });

  test('should render the children inside the container', () => {
    renderLoadMoreContainer(html`<span>Test</span>`);

    const span = container.querySelector('span');
    expect(span).toHaveTextContent('Test');
  });

  test('should have the correct part attribute', () => {
    renderLoadMoreContainer(html`<span>Test</span>`);

    const div = container.querySelector('div');
    expect(div).toHaveAttribute('part', 'container');
  });
});
