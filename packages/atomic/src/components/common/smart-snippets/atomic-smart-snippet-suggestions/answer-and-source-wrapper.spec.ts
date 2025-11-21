import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type AnswerAndSourceWrapperProps,
  renderAnswerAndSourceWrapper,
} from './answer-and-source-wrapper';

describe('#renderAnswerAndSourceWrapper', () => {
  const renderComponent = async (
    props: Partial<AnswerAndSourceWrapperProps> = {},
    children = html`<div>Answer Content</div>`
  ) => {
    const element = await renderFunctionFixture(
      html`${renderAnswerAndSourceWrapper({
        props: {
          id: 'answer-1',
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('div') as HTMLElement;
  };

  it('should render a div element', async () => {
    const wrapper = await renderComponent();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName.toLowerCase()).toBe('div');
  });

  it('should render with answer-and-source part', async () => {
    const wrapper = await renderComponent();
    expect(wrapper.getAttribute('part')).toBe('answer-and-source');
  });

  it('should render with correct id', async () => {
    const wrapper = await renderComponent({id: 'custom-id'});
    expect(wrapper.getAttribute('id')).toBe('custom-id');
  });

  it('should render children', async () => {
    const wrapper = await renderComponent({}, html`<p>Custom Answer</p>`);
    expect(wrapper.textContent).toContain('Custom Answer');
  });
});
