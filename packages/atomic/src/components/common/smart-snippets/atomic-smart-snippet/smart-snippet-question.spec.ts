import {html, render} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import {
  renderSmartSnippetQuestion,
  type SmartSnippetQuestionProps,
} from './smart-snippet-question';

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
