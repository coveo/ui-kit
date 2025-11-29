import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type GeneratedTextContentProps,
  renderGeneratedTextContent,
} from './generated-text-content';

describe('#renderGeneratedTextContent', () => {
  const locators = (element: Element) => ({
    get generatedText() {
      return element.querySelector('p[part="generated-text"]');
    },
  });

  const renderComponent = async (
    props: Partial<GeneratedTextContentProps> = {}
  ) => {
    return await renderFunctionFixture(
      html`${renderGeneratedTextContent({
        props: {
          answer: 'Test answer',
          isStreaming: false,
          ...props,
        },
      })}`
    );
  };

  it('should render a paragraph element for the generated text in the document', async () => {
    const element = await renderComponent();
    const generatedText = locators(element).generatedText;
    expect(generatedText).toBeInTheDocument();
  });

  it('should render the answer text', async () => {
    const element = await renderComponent({
      answer: 'This is my answer',
    });
    const generatedText = locators(element).generatedText;

    expect(generatedText).toHaveTextContent('This is my answer');
  });

  it('should render with correct part attribute', async () => {
    const element = await renderComponent();
    const generatedText = locators(element).generatedText;

    expect(generatedText).toHaveAttribute('part', 'generated-text');
  });

  it('should add "cursor" class when isStreaming is true', async () => {
    const element = await renderComponent({
      isStreaming: true,
    });
    const generatedText = locators(element).generatedText;

    expect(generatedText).toHaveClass('cursor');
  });

  it('should not have "cursor" class when isStreaming is false', async () => {
    const element = await renderComponent({
      isStreaming: false,
    });
    const generatedText = locators(element).generatedText;

    expect(generatedText).not.toHaveClass('cursor');
  });

  it('should handle undefined answer', async () => {
    const element = await renderComponent({
      answer: undefined,
    });
    const generatedText = locators(element).generatedText;

    expect(generatedText).toBeInTheDocument();
    expect(generatedText).toHaveTextContent('');
  });
});
