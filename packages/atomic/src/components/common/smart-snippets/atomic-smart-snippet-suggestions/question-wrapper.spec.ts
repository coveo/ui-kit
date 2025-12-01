import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type QuestionWrapperProps,
  renderQuestionWrapper,
} from './question-wrapper';

describe('#renderQuestionWrapper', () => {
  const renderComponent = async (
    props: Partial<QuestionWrapperProps> = {},
    children = html`<div>Question Content</div>`
  ) => {
    const element = await renderFunctionFixture(
      html`${renderQuestionWrapper({
        props: {
          expanded: false,
          key: 'question-1',
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('li') as HTMLElement;
  };

  it('should render an li element', async () => {
    const wrapper = await renderComponent();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName.toLowerCase()).toBe('li');
  });

  it('should render with collapsed part when not expanded', async () => {
    const wrapper = await renderComponent({expanded: false});
    expect(wrapper.getAttribute('part')).toBe('question-answer-collapsed');
  });

  it('should render with expanded part when expanded', async () => {
    const wrapper = await renderComponent({expanded: true});
    expect(wrapper.getAttribute('part')).toBe('question-answer-expanded');
  });

  it('should render children inside article', async () => {
    const wrapper = await renderComponent({}, html`<div>Custom Content</div>`);
    const article = wrapper.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article?.textContent).toContain('Custom Content');
  });
});
