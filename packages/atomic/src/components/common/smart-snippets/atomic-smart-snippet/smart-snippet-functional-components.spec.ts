import type {i18n} from 'i18next';
import {html, nothing, render} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  renderSmartSnippetFooter,
  renderSmartSnippetQuestion,
  renderSmartSnippetTruncatedAnswer,
  renderSmartSnippetWrapper,
  type SmartSnippetFooterProps,
  type SmartSnippetQuestionProps,
  type SmartSnippetTruncatedAnswerProps,
  type SmartSnippetWrapperProps,
} from './smart-snippet-functional-components';

describe('#renderSmartSnippetWrapper', () => {
  let container: HTMLElement;
  let mockI18n: i18n;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockI18n = {
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'smart-snippet': 'Smart Snippet',
        };
        return translations[key] || key;
      }),
    } as unknown as i18n;
  });

  const renderWrapper = (
    props: Partial<SmartSnippetWrapperProps>,
    children = nothing
  ): HTMLElement => {
    const defaultProps: SmartSnippetWrapperProps = {
      i18n: mockI18n,
      headingLevel: undefined,
      ...props,
    };
    render(
      html`${renderSmartSnippetWrapper({props: defaultProps})(children)}`,
      container
    );
    return container.querySelector('aside')!;
  };

  it('should render an aside element with aria-label', () => {
    const aside = renderWrapper({});
    expect(aside).toBeInTheDocument();
    expect(aside.getAttribute('aria-label')).toBe('Smart Snippet');
  });

  it('should render an article element with the smart-snippet part', () => {
    renderWrapper({});
    const article = container.querySelector('article[part="smart-snippet"]');
    expect(article).toBeInTheDocument();
  });

  it('should render with background and border classes', () => {
    renderWrapper({});
    const article = container.querySelector('article');
    expect(article).toHaveClass('bg-background');
    expect(article).toHaveClass('border-neutral');
    expect(article).toHaveClass('text-on-background');
    expect(article).toHaveClass('rounded-lg');
    expect(article).toHaveClass('border');
  });

  it('should render a heading with sr-only class', () => {
    renderWrapper({});
    const heading = container.querySelector('.sr-only');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent?.trim()).toBe('Smart Snippet');
  });

  it('should render heading with level 0 when headingLevel is undefined', () => {
    renderWrapper({headingLevel: undefined});
    const heading = container.querySelector('div.sr-only');
    expect(heading).toBeInTheDocument();
  });

  it('should render heading with specified level', () => {
    renderWrapper({headingLevel: 2});
    const heading = container.querySelector('h2.sr-only');
    expect(heading).toBeInTheDocument();
  });

  it('should render children inside the article', () => {
    const children = html`<p>Test Content</p>`;
    renderWrapper({}, children);
    const article = container.querySelector('article');
    expect(article?.textContent).toContain('Test Content');
  });

  it('should call i18n.t with smart-snippet key', () => {
    renderWrapper({});
    expect(mockI18n.t).toHaveBeenCalledWith('smart-snippet');
  });
});

describe('#renderSmartSnippetQuestion', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderQuestion = (
    props: Partial<SmartSnippetQuestionProps>
  ): HTMLElement => {
    const defaultProps: SmartSnippetQuestionProps = {
      question: 'What is a smart snippet?',
      headingLevel: undefined,
      ...props,
    };
    render(
      html`${renderSmartSnippetQuestion({props: defaultProps})}`,
      container
    );
    return container.firstElementChild as HTMLElement;
  };

  it('should render the question text', () => {
    const question = renderQuestion({question: 'What is a smart snippet?'});
    expect(question.textContent?.trim()).toBe('What is a smart snippet?');
  });

  it('should render with text-xl and font-bold classes', () => {
    const question = renderQuestion({});
    expect(question).toHaveClass('text-xl');
    expect(question).toHaveClass('font-bold');
  });

  it('should render with the question part', () => {
    const question = renderQuestion({});
    expect(question.getAttribute('part')).toBe('question');
  });

  it('should render as a div when headingLevel is undefined', () => {
    const question = renderQuestion({headingLevel: undefined});
    expect(question.tagName.toLowerCase()).toBe('div');
  });

  it('should render as a div when headingLevel is 0', () => {
    const question = renderQuestion({headingLevel: 0});
    expect(question.tagName.toLowerCase()).toBe('div');
  });

  it('should render with incremented heading level', () => {
    const question = renderQuestion({headingLevel: 2});
    expect(question.tagName.toLowerCase()).toBe('h3');
  });

  it('should render as h2 when headingLevel is 1', () => {
    const question = renderQuestion({headingLevel: 1});
    expect(question.tagName.toLowerCase()).toBe('h2');
  });
});

describe('#renderSmartSnippetTruncatedAnswer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderTruncatedAnswer = (
    props: Partial<SmartSnippetTruncatedAnswerProps>
  ): HTMLElement => {
    const defaultProps: SmartSnippetTruncatedAnswerProps = {
      answer: '<p>This is the answer</p>',
      style: undefined,
      ...props,
    };
    render(
      html`${renderSmartSnippetTruncatedAnswer({props: defaultProps})}`,
      container
    );
    return container.firstElementChild as HTMLElement;
  };

  it('should render a div with truncated-answer part', () => {
    const answer = renderTruncatedAnswer({});
    expect(answer).toBeInTheDocument();
    expect(answer.getAttribute('part')).toBe('truncated-answer');
  });

  it('should render atomic-smart-snippet-answer component', () => {
    renderTruncatedAnswer({});
    const answerElement = container.querySelector(
      'atomic-smart-snippet-answer'
    );
    expect(answerElement).toBeInTheDocument();
  });

  it('should set htmlContent property on atomic-smart-snippet-answer', () => {
    renderTruncatedAnswer({answer: '<p>Test answer</p>'});
    const answerElement = container.querySelector(
      'atomic-smart-snippet-answer'
      // biome-ignore lint/suspicious/noExplicitAny: testing property access on custom element
    ) as any;
    expect(answerElement.htmlContent).toBe('<p>Test answer</p>');
  });

  it('should set innerStyle property when style is provided', () => {
    renderTruncatedAnswer({style: 'color: red;'});
    const answerElement = container.querySelector(
      'atomic-smart-snippet-answer'
      // biome-ignore lint/suspicious/noExplicitAny: testing property access on custom element
    ) as any;
    expect(answerElement.innerStyle).toBe('color: red;');
  });

  it('should set exportparts attribute', () => {
    renderTruncatedAnswer({});
    const answerElement = container.querySelector(
      'atomic-smart-snippet-answer'
    );
    expect(answerElement?.getAttribute('exportparts')).toBe('answer');
  });

  it('should set part attribute to body', () => {
    renderTruncatedAnswer({});
    const answerElement = container.querySelector(
      'atomic-smart-snippet-answer'
    );
    expect(answerElement?.getAttribute('part')).toBe('body');
  });
});

describe('#renderSmartSnippetFooter', () => {
  let container: HTMLElement;
  let mockI18n: i18n;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockI18n = {
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'smart-snippet-source': 'Source',
        };
        return translations[key] || key;
      }),
    } as unknown as i18n;
  });

  const renderFooter = (
    props: Partial<SmartSnippetFooterProps>,
    children = nothing
  ): HTMLElement => {
    const defaultProps: SmartSnippetFooterProps = {
      i18n: mockI18n,
      ...props,
    };
    render(
      html`${renderSmartSnippetFooter({props: defaultProps})(children)}`,
      container
    );
    return container.querySelector('footer')!;
  };

  it('should render a footer element', () => {
    const footer = renderFooter({});
    expect(footer).toBeInTheDocument();
  });

  it('should render with footer part', () => {
    const footer = renderFooter({});
    expect(footer.getAttribute('part')).toBe('footer');
  });

  it('should render with aria-label', () => {
    const footer = renderFooter({});
    expect(footer.getAttribute('aria-label')).toBe('Source');
  });

  it('should call i18n.t with smart-snippet-source key', () => {
    renderFooter({});
    expect(mockI18n.t).toHaveBeenCalledWith('smart-snippet-source');
  });

  it('should render children inside the footer', () => {
    const children = html`<p>Footer Content</p>`;
    renderFooter({}, children);
    const footer = container.querySelector('footer');
    expect(footer?.textContent).toContain('Footer Content');
  });
});
