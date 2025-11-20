import {html, render} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {
  renderSmartSnippetTruncatedAnswer,
  type SmartSnippetTruncatedAnswerProps,
} from './smart-snippet-truncated-answer';

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
