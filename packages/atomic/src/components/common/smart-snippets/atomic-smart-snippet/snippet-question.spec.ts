import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  renderSnippetQuestion,
  type SnippetQuestionProps,
} from './snippet-question';

describe('#renderSnippetQuestion', () => {
  const renderComponent = async (props: Partial<SnippetQuestionProps> = {}) => {
    const element = await renderFunctionFixture(
      html`${renderSnippetQuestion({
        props: {
          question: 'What is a smart snippet?',
          headingLevel: undefined,
          ...props,
        },
      })}`
    );

    return element.firstElementChild as HTMLElement;
  };

  it('should render the question text', async () => {
    const question = await renderComponent({
      question: 'What is a smart snippet?',
    });
    expect(question.textContent?.trim()).toBe('What is a smart snippet?');
  });

  it('should render with text-xl and font-bold classes', async () => {
    const question = await renderComponent({});
    expect(question).toHaveClass('text-xl');
    expect(question).toHaveClass('font-bold');
  });

  it('should render with the question part', async () => {
    const question = await renderComponent({});
    expect(question.getAttribute('part')).toBe('question');
  });

  it('should render as a div when headingLevel is undefined', async () => {
    const question = await renderComponent({headingLevel: undefined});
    expect(question.tagName.toLowerCase()).toBe('div');
  });

  it('should render as a div when headingLevel is 0', async () => {
    const question = await renderComponent({headingLevel: 0});
    expect(question.tagName.toLowerCase()).toBe('div');
  });

  it('should render with incremented heading level', async () => {
    const question = await renderComponent({headingLevel: 2});
    expect(question.tagName.toLowerCase()).toBe('h3');
  });

  it('should render as h2 when headingLevel is 1', async () => {
    const question = await renderComponent({headingLevel: 1});
    expect(question.tagName.toLowerCase()).toBe('h2');
  });
});
