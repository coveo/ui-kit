import DOMPurify from 'dompurify';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type GeneratedMarkdownContentProps,
  renderGeneratedMarkdownContent,
} from './generated-markdown-content';
import {transformMarkdownToHtml} from './markdown-utils';

vi.mock('dompurify', {spy: true});
vi.mock('./markdown-utils', {spy: true});

describe('#renderGeneratedMarkdownContent', () => {
  const locators = (element: Element) => ({
    get generatedText() {
      return element.querySelector('div[part="generated-text"]');
    },
  });

  const renderComponent = async (
    props: Partial<GeneratedMarkdownContentProps> = {}
  ) => {
    return await renderFunctionFixture(
      html`${renderGeneratedMarkdownContent({
        props: {
          answer: 'Test answer',
          isStreaming: false,
          ...props,
        },
      })}`
    );
  };

  it('should render a div element for the generated text in the document', async () => {
    const element = await renderComponent();
    const generatedText = locators(element).generatedText;
    expect(generatedText).toBeInTheDocument();
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

  it('should call transformMarkdownToHtml with the answer', async () => {
    const mockedTransformMarkdownToHtml = vi.mocked(transformMarkdownToHtml);
    const answer = '**bold** markdown';
    await renderComponent({answer});

    expect(mockedTransformMarkdownToHtml).toHaveBeenCalledWith(answer);
  });

  it('should call transformMarkdownToHtml with empty string when answer is undefined', async () => {
    const mockedTransformMarkdownToHtml = vi.mocked(transformMarkdownToHtml);
    await renderComponent({answer: undefined});

    expect(mockedTransformMarkdownToHtml).toHaveBeenCalledWith('');
  });

  it('should call DOMPurify.sanitize with the transformed HTML and with ADD_ATTR config to preserve part attributes', async () => {
    const mockedTransformMarkdownToHtml = vi.mocked(transformMarkdownToHtml);
    const answer = '# Heading';
    const transformedHtml = '<h1 part="answer-heading-1">Heading</h1>';
    const sanitizedHtml = '<h1 part="answer-heading-1">Heading</h1>';

    mockedTransformMarkdownToHtml.mockReturnValue(transformedHtml);
    vi.mocked(DOMPurify.sanitize).mockReturnValue(sanitizedHtml);

    await renderComponent({answer});

    expect(mockedTransformMarkdownToHtml).toHaveBeenCalledWith(answer);
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(transformedHtml, {
      ADD_ATTR: ['part'],
    });
  });

  it('should render the sanitized HTML content', async () => {
    const mockSanitizedHtml =
      '<p part="answer-paragraph">Sanitized content</p>';
    vi.mocked(DOMPurify.sanitize).mockReturnValue(mockSanitizedHtml);

    const element = await renderComponent({answer: 'Test'});
    const generatedText = locators(element).generatedText;

    expect(generatedText?.innerHTML).toContain('Sanitized content');
  });
});
