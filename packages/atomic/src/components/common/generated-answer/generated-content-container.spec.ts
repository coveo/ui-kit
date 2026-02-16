import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type GeneratedContentContainerProps,
  renderGeneratedContentContainer,
} from './generated-content-container';

describe('#renderGeneratedContentContainer', () => {
  const locators = (element: Element) => ({
    get container() {
      return element.querySelector('div[part="generated-container"]');
    },
    get textContent() {
      return element.querySelector('p[part="generated-text"]');
    },
    get markdownContent() {
      return element.querySelector('div[part="generated-text"]');
    },
    get footer() {
      return element.querySelector('.footer');
    },
  });

  const renderComponent = async (
    props: Partial<GeneratedContentContainerProps> = {},
    children = html``
  ) => {
    return await renderFunctionFixture(
      html`${renderGeneratedContentContainer({
        props: {
          answer: 'Test answer',
          answerContentFormat: undefined,
          isStreaming: false,
          ...props,
        },
      })(children)}`
    );
  };

  it('should render a container in the document', async () => {
    const element = await renderComponent();
    const container = locators(element).container;
    expect(container).toBeInTheDocument();
  });

  it('should render with correct part attribute', async () => {
    const element = await renderComponent();
    const container = locators(element).container;

    expect(container).toHaveAttribute('part', 'generated-container');
  });

  it('should render text content by default', async () => {
    const element = await renderComponent({
      answer: 'Plain text answer',
      answerContentFormat: undefined,
    });
    const textContent = locators(element).textContent;

    expect(textContent).toBeInTheDocument();
    expect(textContent).toHaveTextContent('Plain text answer');
  });

  it('should render markdown content when format is text/markdown', async () => {
    const element = await renderComponent({
      answer: '**Bold text**',
      answerContentFormat: 'text/markdown',
    });
    const markdownContent = locators(element).markdownContent;

    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent?.innerHTML).toContain('<strong');
  });

  it('should render text content when format is not text/markdown', async () => {
    const element = await renderComponent({
      answer: '**Not markdown**',
      answerContentFormat: 'text/plain',
    });
    const textContent = locators(element).textContent;

    expect(textContent).toBeInTheDocument();
    expect(textContent).toHaveTextContent('**Not markdown**');
  });

  it('should pass isStreaming prop to text content', async () => {
    const element = await renderComponent({
      isStreaming: true,
      answerContentFormat: undefined,
    });
    const textContent = locators(element).textContent;

    expect(textContent).toHaveClass('cursor');
  });

  it('should pass isStreaming prop to markdown content', async () => {
    const element = await renderComponent({
      isStreaming: true,
      answerContentFormat: 'text/markdown',
    });
    const markdownContent = locators(element).markdownContent;

    expect(markdownContent).toHaveClass('cursor');
  });

  it('should render the footer', async () => {
    const element = await renderComponent();
    const footer = locators(element).footer;

    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('footer');
  });

  it('should render children in footer', async () => {
    const element = await renderComponent(
      {},
      html`<div class="test-child">Child content</div>`
    );
    const footer = locators(element).footer;

    expect(footer?.querySelector('.test-child')).toBeInTheDocument();
    expect(footer?.querySelector('.test-child')).toHaveTextContent(
      'Child content'
    );
  });

  it('should render multiple children in footer', async () => {
    const element = await renderComponent(
      {},
      html`
        <button class="btn-1">Button 1</button>
        <button class="btn-2">Button 2</button>
      `
    );
    const footer = locators(element).footer;

    expect(footer?.querySelector('.btn-1')).toBeInTheDocument();
    expect(footer?.querySelector('.btn-2')).toBeInTheDocument();
  });

  it('should handle undefined answer', async () => {
    const element = await renderComponent({
      answer: undefined,
    });
    const container = locators(element).container;

    expect(container).toBeInTheDocument();
  });
});
