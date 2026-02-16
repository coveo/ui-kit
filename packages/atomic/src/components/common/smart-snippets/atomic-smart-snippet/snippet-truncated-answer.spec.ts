import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  renderSnippetTruncatedAnswer,
  type SnippetTruncatedAnswerProps,
} from './snippet-truncated-answer';

describe('#renderSnippetTruncatedAnswer', () => {
  const renderComponent = async (
    props: Partial<SnippetTruncatedAnswerProps> = {}
  ) => {
    const element = await renderFunctionFixture(
      html`${renderSnippetTruncatedAnswer({
        props: {
          answer: '<p>This is the answer</p>',
          style: undefined,
          ...props,
        },
      })}`
    );

    return element.firstElementChild as HTMLElement;
  };

  it('should render a div with truncated-answer part', async () => {
    const answer = await renderComponent({});
    expect(answer).toBeInTheDocument();
    expect(answer.getAttribute('part')).toBe('truncated-answer');
  });

  it('should render atomic-smart-snippet-answer component', async () => {
    const answer = await renderComponent({});
    const answerElement = answer.querySelector('atomic-smart-snippet-answer');
    expect(answerElement).toBeInTheDocument();
  });

  it('should set htmlContent property on atomic-smart-snippet-answer', async () => {
    const answer = await renderComponent({answer: '<p>Test answer</p>'});
    const answerElement = answer.querySelector(
      'atomic-smart-snippet-answer'
      // biome-ignore lint/suspicious/noExplicitAny: testing property access on custom element
    ) as any;
    expect(answerElement.htmlContent).toBe('<p>Test answer</p>');
  });

  it('should set innerStyle property when style is provided', async () => {
    const answer = await renderComponent({style: 'color: red;'});
    const answerElement = answer.querySelector(
      'atomic-smart-snippet-answer'
      // biome-ignore lint/suspicious/noExplicitAny: testing property access on custom element
    ) as any;
    expect(answerElement.innerStyle).toBe('color: red;');
  });

  it('should set exportparts attribute', async () => {
    const answer = await renderComponent({});
    const answerElement = answer.querySelector('atomic-smart-snippet-answer');
    expect(answerElement?.getAttribute('exportparts')).toBe('answer');
  });

  it('should set part attribute to body', async () => {
    const answer = await renderComponent({});
    const answerElement = answer.querySelector('atomic-smart-snippet-answer');
    expect(answerElement?.getAttribute('part')).toBe('body');
  });
});
